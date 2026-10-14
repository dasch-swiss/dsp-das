import { inject, Injectable, signal } from '@angular/core';
import { KnoraDate, KnoraPeriod, Precision } from '@dasch-swiss/dsp-js';
import {
  CALENDAR_SYSTEMS,
  CalendarDate,
  CalendarSystem,
  convertCalendarResult,
  createDate,
  getCalendar,
  isEqual,
  isPeriodOutOfOrder,
  jdnRange,
} from '@dasch-swiss/vre/shared/calendar';
import { TranslateService } from '@ngx-translate/core';

/**
 * Weekday names by `jdn % 7`, where 0 is Monday.
 *
 * Keys into `ui.weekdays.*`, which the picker's grid header reads too — hence a namespace of its
 * own rather than one belonging to either surface.
 */
export const WEEKDAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

/**
 * A date value seen through a calendar other than the one it is stored in.
 *
 * `end` is present only when the source covers a range in the target calendar — a Julian year
 * straddling two Gregorian ones, say. Keeping it optional is what stops a caller printing a single
 * date for something the source never pinned down that precisely.
 */
export interface ConvertedKnoraDate {
  readonly start: KnoraDate;
  readonly end?: KnoraDate;
}

/** One month laid out for a day grid: `0` is a leading blank, everything else is a day number. */
export interface MonthGrid {
  readonly weeks: number[][];
}

/**
 * Every calendar rule applied to a `KnoraDate`, in one place.
 *
 * Nothing here holds state or touches a component: given the same arguments it returns the same
 * answer.
 *
 * The arithmetic itself belongs to `@dasch-swiss/vre/shared/calendar`; this service adapts it to
 * `KnoraDate` — precision, era, and the astronomical-year convention — and formats the result.
 */
@Injectable({ providedIn: 'root' })
export class CalendarDateService {
  /**
   * The translate service, when there is an injector to ask for one.
   *
   * `KnoraDatePipe` is constructed with `new`, outside any injection context, where `inject()`
   * throws NG0203 even with `{ optional: true }` — hence the try/catch. Without it, names fall back
   * to title case.
   */
  private readonly _translate = CalendarDateService._injectTranslateIfPossible();

  /**
   * Bumped whenever the language or its translations change. Translated names read it, so a
   * `computed` showing one recomputes when the language changes or its translations finish loading.
   */
  private readonly _language = signal(0);

  constructor() {
    const bump = () => this._language.update(n => n + 1);
    this._translate?.onLangChange.subscribe(bump);
    this._translate?.onTranslationChange.subscribe(bump);
    this._translate?.onDefaultLangChange.subscribe(bump);
  }

  private static _injectTranslateIfPossible(): TranslateService | null {
    try {
      return inject(TranslateService, { optional: true });
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Converting
  // ---------------------------------------------------------------------------------------------

  /**
   * the same day, expressed in another calendar.
   *
   * `undefined` where the target cannot express it — an Islamic reading of a date before the Hijra.
   * A range comes back with both ends when the source covers one: a Julian year is two Gregorian
   * ones, and reporting only the first would claim a precision the source never had.
   *
   * This is the *reading*, which the date viewer shows. Editing restates a year or a month instead
   * of converting it to the days it covers — see {@link restateKnoraDateIn}.
   */
  convertKnoraDateTo(date: KnoraDate, calendar: CalendarSystem): ConvertedKnoraDate | undefined {
    const result = convertCalendarResult(this.createJDNCalendarDateFromKnoraDate(date), calendar);

    if (result.kind === 'refused') {
      return undefined;
    }
    if (result.kind === 'exact') {
      return { start: this.createKnoraDateFromCalendarDate(result.date) };
    }
    return {
      start: this.createKnoraDateFromCalendarDate(result.start),
      end: this.createKnoraDateFromCalendarDate(result.end),
    };
  }

  /**
   * a date as the editor restates it when the user switches its calendar.
   *
   * A day converts. A year or a month does not: someone who entered "July 1600" or "1600" means that
   * month or year, not the span of days it covers — which is what {@link convertKnoraDateTo}, the
   * viewer's reading, reports. Julian and Gregorian name their years and months alike, so the
   * numbers stay. Islamic names its own, so the date takes the Islamic year or month that contains
   * its first day, and the other way round.
   *
   * `undefined` where the target cannot express it — including a year or month whose first day lies
   * before the Hijra, which no Islamic year or month contains.
   */
  restateKnoraDateIn(date: KnoraDate, calendar: CalendarSystem): KnoraDate | undefined {
    if (date.calendar.toUpperCase() === calendar) {
      return date;
    }
    if (date.precision === Precision.dayPrecision) {
      return this.convertKnoraDateTo(date, calendar)?.start;
    }
    const involvesIslamic = date.calendar.toUpperCase() === 'ISLAMIC' || calendar === 'ISLAMIC';
    if (!involvesIslamic) {
      return new KnoraDate(calendar, date.era, date.year, date.month);
    }
    const firstDay = new KnoraDate(date.calendar, date.era, date.year, date.month ?? 1, 1);
    const converted = this.convertKnoraDateTo(firstDay, calendar)?.start;
    if (converted === undefined) {
      return undefined;
    }
    const month = date.precision === Precision.monthPrecision ? converted.month : undefined;
    return new KnoraDate(converted.calendar, converted.era, converted.year, month);
  }

  /** which calendars the editor can restate a value in, by {@link restateKnoraDateIn}. */
  restatableCalendarsFor(value: KnoraDate | KnoraPeriod): CalendarSystem[] {
    const dates = value instanceof KnoraPeriod ? [value.start, value.end] : [value];

    return CALENDAR_SYSTEMS.filter(calendar =>
      dates.every(date => this.restateKnoraDateIn(date, calendar) !== undefined)
    );
  }

  /**
   * the next day, month or year after a date, at its precision — what a period's end starts as.
   *
   * Days count through the day number, so month ends, leap days and each calendar's own rules take
   * care of themselves. Years count astronomically, so 1 BCE is followed by 1 CE.
   */
  nextKnoraDate(date: KnoraDate): KnoraDate | undefined {
    const calendar = date.calendar.toUpperCase() as CalendarSystem;
    if (date.precision === Precision.dayPrecision) {
      const jdn = this.julianDayNumber(date);
      return jdn === undefined
        ? undefined
        : this.createKnoraDateFromCalendarDate(getCalendar(calendar).fromJDN(jdn + 1));
    }
    const astronomical = this.convertHistoricalYearToAstronomicalYear(date.year, date.era);
    if (date.precision === Precision.yearPrecision) {
      const { year, era } = this.convertAstronomicalYearToHistoricalYear(astronomical + 1, calendar);
      return new KnoraDate(date.calendar, era, year);
    }
    const rollsOver = date.month === 12;
    const { year, era } = this.convertAstronomicalYearToHistoricalYear(
      rollsOver ? astronomical + 1 : astronomical,
      calendar
    );
    return new KnoraDate(date.calendar, era, year, rollsOver ? 1 : date.month! + 1);
  }

  /**
   * whether a day lies in the ten the Gregorian reform skipped: 5–14 October 1582.
   *
   * The Gregorian calendar here is proleptic, as in dsp-api, so these are valid dates and are
   * stored as given — the same days as 25 September to 4 October 1582 Julian. But they never
   * occurred where the reform took effect, so wherever one is shown or produced, it is said so
   * rather than passed off as an ordinary day.
   */
  isSkippedByGregorianReform(date: KnoraDate): boolean {
    return (
      date.calendar.toUpperCase() === 'GREGORIAN' &&
      date.era !== 'BCE' &&
      date.year === 1582 &&
      date.month === 10 &&
      date.day !== undefined &&
      date.day >= 5 &&
      date.day <= 14
    );
  }

  /**
   * what to say about a value one of whose days the Gregorian reform skipped, or `undefined`.
   *
   * The day as stored, and the Julian day it is — the one the calendar in use there at the time
   * would have written. Shared by the editor and the viewer, so both say the same thing.
   */
  reformGapOf(value: KnoraDate | KnoraPeriod): { date: string; julian: string } | undefined {
    const dates = value instanceof KnoraPeriod ? [value.start, value.end] : [value];
    const skipped = dates.find(date => this.isSkippedByGregorianReform(date));
    const julian = skipped && this.convertKnoraDateTo(skipped, 'JULIAN')?.start;
    if (skipped === undefined || julian === undefined) {
      return undefined;
    }
    const text = (date: KnoraDate) => `${this.format(date, 'dd.MM.YYYY', 'era')} ${this.calendarName(date.calendar)}`;
    return { date: text(skipped), julian: text(julian) };
  }

  /**
   * a date value as ISO 8601 — which, for anything DSP stores, is also valid EDTF.
   *
   * Both formats are Gregorian, so the value is written in proleptic Gregorian, as dsp-api stores
   * it, and covers exactly the days dsp-api stores for it. A Gregorian month or year keeps its
   * precision (`1850-03`); a Julian or Islamic month or year is no Gregorian month or year, so it
   * becomes its exact days (`1582-01-11/1583-01-10`); a period is an interval, each end by the same
   * rule. No uncertainty markers: DSP stores none. Years are astronomical (`0000` is 1 BCE).
   * The mapping and its decisions: dasch-specs `10-machine-readable-dates.md`.
   */
  machineReadableOf(value: KnoraDate | KnoraPeriod): string {
    if (value instanceof KnoraPeriod) {
      return `${this._isoEnds(value.start).first}/${this._isoEnds(value.end).last}`;
    }
    const ends = this._isoEnds(value);
    return ends.first === ends.last ? ends.first : `${ends.first}/${ends.last}`;
  }

  /**
   * One date's ISO 8601 ends: the same string twice where ISO 8601 can state it as it is (a day, or
   * a Gregorian month or year), else the Gregorian first and last day it covers.
   */
  private _isoEnds(date: KnoraDate): { first: string; last: string } {
    const calendar = date.calendar.toUpperCase() as CalendarSystem;
    if (calendar === 'GREGORIAN') {
      const year = this.convertHistoricalYearToAstronomicalYear(date.year, date.era);
      const text = [this._isoYear(year), date.month, date.day]
        .filter(part => part !== undefined)
        .map((part, i) => (i === 0 ? part : String(part).padStart(2, '0')))
        .join('-');
      return { first: text, last: text };
    }
    const { first, last } = this.julianDayRangeOf(date);
    const gregorian = getCalendar('GREGORIAN');
    const isoDay = (jdn: number) => this._isoEnds(this.createKnoraDateFromCalendarDate(gregorian.fromJDN(jdn))).first;
    return { first: isoDay(first), last: isoDay(last) };
  }

  /** a year as ISO 8601 writes it: four digits, signed when negative (`-0043` is 44 BCE). */
  private _isoYear(astronomical: number): string {
    const digits = String(Math.abs(astronomical)).padStart(4, '0');
    return astronomical < 0 ? `-${digits}` : digits;
  }

  /**
   * today, in the calendar asked for.
   *
   * Today is a Gregorian fact — that is what the system clock reports — and every other calendar is
   * reached by the same conversion as everything else. Not `Intl.DateTimeFormat`: its Islamic
   * calendar is the observational one, which on some days names a date the tabular grid lacks.
   */
  today(calendar: CalendarSystem): KnoraDate | undefined {
    const now = new Date();
    const gregorian = new KnoraDate('GREGORIAN', 'CE', now.getFullYear(), now.getMonth() + 1, now.getDate());

    return calendar === 'GREGORIAN' ? gregorian : this.convertKnoraDateTo(gregorian, calendar)?.start;
  }

  // ---------------------------------------------------------------------------------------------
  // Comparing
  // ---------------------------------------------------------------------------------------------

  /**
   * whether two dates denote the same instant, whatever calendar represents them.
   *
   * Converting a date rewrites every field while meaning the same day: 15.06.2024 Gregorian and
   * 02.06.2024 Julian are one instant. Comparing fields therefore reports a change the user never
   * made, which is why a calendar switch must be measured this way — the save gate depends on it.
   *
   * Precision is part of what a date says, so a year and a day inside it are not the same instant.
   */
  knoraDatesDenoteSameInstant(a: KnoraDate, b: KnoraDate): boolean {
    if (a.precision !== b.precision) {
      return false;
    }
    return isEqual(this.createJDNCalendarDateFromKnoraDate(a), this.createJDNCalendarDateFromKnoraDate(b));
  }

  /** whether a period's start lies after its end, by the rule dsp-api applies. */
  isPeriodOutOfOrder(start: KnoraDate, end: KnoraDate): boolean {
    return isPeriodOutOfOrder(
      this.createJDNCalendarDateFromKnoraDate(start),
      this.createJDNCalendarDateFromKnoraDate(end)
    );
  }

  /** the same question for a whole value, which may be a period. */
  dateValuesDenoteSameInstant(
    a: KnoraDate | KnoraPeriod | null | undefined,
    b: KnoraDate | KnoraPeriod | null | undefined
  ): boolean {
    if (a == null || b == null) {
      return a == null && b == null;
    }
    if (a instanceof KnoraPeriod !== b instanceof KnoraPeriod) {
      return false;
    }
    if (a instanceof KnoraPeriod && b instanceof KnoraPeriod) {
      return this.knoraDatesDenoteSameInstant(a.start, b.start) && this.knoraDatesDenoteSameInstant(a.end, b.end);
    }
    return this.knoraDatesDenoteSameInstant(a as KnoraDate, b as KnoraDate);
  }

  // ---------------------------------------------------------------------------------------------
  // Months and grids
  // ---------------------------------------------------------------------------------------------

  /** how many days a month holds, in the calendar and year given. */
  daysInMonth(calendar: string, year: number, month: number): number {
    const calendarSystem = calendar.toUpperCase() as CalendarSystem;
    return getCalendar(calendarSystem).daysInMonth(year, month);
  }

  /**
   * one month laid out for a day grid, as rows of seven.
   *
   * `0` pads the first row so the 1st lands under its weekday, in every calendar and every era.
   *
   * Every day of every month, October 1582 included: the Gregorian calendar is proleptic, as in
   * dsp-api, so 5–14 October 1582 are valid dates and keep their cells, or 15–31 would sit under the
   * wrong weekdays. They are marked instead — see {@link isSkippedByGregorianReform}.
   */
  monthGrid(calendar: string, era: string, year: number, month: number): MonthGrid {
    const yearAstro = this.convertHistoricalYearToAstronomicalYear(year, era);
    const calendarSystem = calendar.toUpperCase() as CalendarSystem;
    const days = this.daysInMonth(calendarSystem, yearAstro, month);

    const cells: number[] = [];

    for (let i = 1; i < this._firstWeekdayOfMonth(calendarSystem, yearAstro, month); i++) {
      cells.push(0);
    }

    for (let i = 1; i <= days; i++) {
      cells.push(i);
    }

    const weeks: number[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return { weeks };
  }

  /**
   * which weekday the 1st falls on, 1 = Monday.
   *
   * Counted from the Julian Day Number, which is a continuous day count: JDN 0 was a Monday, so
   * `jdn % 7` is the weekday with no calendar knowledge of its own. Every calendar the library
   * supports already converts to JDN — it is how conversion and comparison work — so this needs no
   * rule per calendar, no branch at the Gregorian reform, and no special case for BCE or for a
   * calendar without an era.
   *
   * `year` is astronomical here, as the library expects: 100 BCE is -99.
   */
  private _firstWeekdayOfMonth(calendar: CalendarSystem, yearAstro: number, month: number): number {
    const firstOfMonth = createDate(
      calendar,
      yearAstro,
      month,
      1,
      calendar === 'ISLAMIC' ? 'NONE' : yearAstro <= 0 ? 'BCE' : 'CE'
    );
    const jdn = getCalendar(calendar).toJDN(firstOfMonth);

    // JavaScript's % keeps the sign of the dividend, and a proleptic date can land on a negative
    // JDN, so the result is normalised into 0..6 before being shifted to 1 = Monday.
    return (((jdn % 7) + 7) % 7) + 1;
  }

  /**
   * the Julian Day Number of a date, or `undefined` unless it names a single day.
   *
   * A JDN is one day's position in a continuous count, so only a day-precision date has one: a
   * value stored as `1582` covers 365 of them and a month covers about thirty. Returning
   * `undefined` there is what stops a caller printing one number for a span the source never
   * narrowed down.
   */
  julianDayNumber(date: KnoraDate): number | undefined {
    if (date.precision !== Precision.dayPrecision) {
      return undefined;
    }
    const calendar = date.calendar.toUpperCase() as CalendarSystem;
    return getCalendar(calendar).toJDN(this.createJDNCalendarDateFromKnoraDate(date));
  }

  /**
   * the Julian Day Numbers a date value covers: the first day of its start and the last of its end.
   *
   * Unlike {@link julianDayNumber}, this answers at any precision, because a range states no more
   * than the source did: Gregorian 1612 is 2309831–2310196, and the period 1612–1613 is
   * 2309831–2310561 — exactly the days dsp-api stores for the value. A day gives the same number
   * twice.
   */
  julianDayRangeOf(value: KnoraDate | KnoraPeriod): { first: number; last: number } {
    const start = value instanceof KnoraPeriod ? value.start : value;
    const end = value instanceof KnoraPeriod ? value.end : value;
    return {
      first: jdnRange(this.createJDNCalendarDateFromKnoraDate(start)).first,
      last: jdnRange(this.createJDNCalendarDateFromKnoraDate(end)).last,
    };
  }

  /**
   * which day of the week a date falls on, or `undefined` unless it names a single day.
   *
   * Counted from the JDN, which is a continuous day count: JDN 0 was a Monday. The name is
   * translated where a translate service is available, and falls back to English otherwise — the
   * same arrangement the calendar names use.
   */
  weekdayOf(date: KnoraDate): string | undefined {
    const jdn = this.julianDayNumber(date);
    if (jdn === undefined) {
      return undefined;
    }
    // Read so a computed showing the weekday follows a language switch, as calendar names do.
    this._language();
    const key = WEEKDAY_KEYS[((jdn % 7) + 7) % 7];
    const translationKey = `ui.weekdays.${key}.long`;
    const translated = this._translate?.instant(translationKey);
    return translated && translated !== translationKey ? translated : key;
  }

  /**
   * how many days a period covers, counting both ends.
   *
   * Inclusive, because that is how a span is spoken about: 1–12 January is twelve days, not
   * eleven. `undefined` unless both ends name a single day, for the same reason a JDN is.
   */
  durationInDays(period: KnoraPeriod): number | undefined {
    const start = this.julianDayNumber(period.start);
    const end = this.julianDayNumber(period.end);
    if (start === undefined || end === undefined) {
      return undefined;
    }
    return end - start + 1;
  }

  // ---------------------------------------------------------------------------------------------
  // Years and eras
  // ---------------------------------------------------------------------------------------------

  /**
   * the astronomical year for a historical one.
   *
   * Historical reckoning has no year zero, so 1 BCE is astronomical 0 and 44 BCE is −43.
   */
  convertHistoricalYearToAstronomicalYear(year: number, era: string): number {
    return era === 'BCE' ? year * -1 + 1 : year;
  }

  /** the historical year and era for an astronomical one; Islamic has no era at all. */
  convertAstronomicalYearToHistoricalYear(yearAstro: number, calendar: CalendarSystem): { year: number; era: string } {
    if (calendar === 'ISLAMIC') {
      return { year: yearAstro, era: 'noEra' };
    }
    return yearAstro <= 0 ? { year: yearAstro * -1 + 1, era: 'BCE' } : { year: yearAstro, era: 'CE' };
  }

  // ---------------------------------------------------------------------------------------------
  // Crossing between KnoraDate and the calendar library
  // ---------------------------------------------------------------------------------------------

  /** a `KnoraDate` as the calendar library's own date, at whatever precision it carries. */
  createJDNCalendarDateFromKnoraDate(date: KnoraDate): CalendarDate {
    const yearAstro = this.convertHistoricalYearToAstronomicalYear(date.year, date.era);
    const calendarSystem = date.calendar.toUpperCase() as CalendarSystem;
    const era = date.era === 'BCE' ? 'BCE' : date.era === 'noEra' ? 'NONE' : 'CE';

    if (date.precision === Precision.dayPrecision) {
      return createDate(calendarSystem, yearAstro, date.month!, date.day!, era as never);
    }
    if (date.precision === Precision.monthPrecision) {
      return createDate(calendarSystem, yearAstro, date.month!, undefined, era as never);
    }
    if (date.precision === Precision.yearPrecision) {
      return createDate(calendarSystem, yearAstro, undefined, undefined, era as never);
    }
    throw Error('Invalid precision');
  }

  /**
   * the inverse.
   *
   * The two type systems spell the absent era differently — `NONE` there, `noEra` in `KnoraDate` —
   * so the mapping is explicit rather than incidental.
   */
  createKnoraDateFromCalendarDate(date: CalendarDate): KnoraDate {
    const { year, era } = this.convertAstronomicalYearToHistoricalYear(date.year, date.calendar);
    return new KnoraDate(date.calendar, era, year, date.month, date.day);
  }

  // ---------------------------------------------------------------------------------------------
  // Formatting
  // ---------------------------------------------------------------------------------------------

  /** a date as text, optionally carrying its era, its calendar, or both. */
  format(
    date: KnoraDate,
    formatPattern?: string,
    displayOptions?: 'era' | 'eraWhereAmbiguous' | 'calendar' | 'calendarOnly' | 'gravsearch' | 'all'
  ): string {
    if (!(date instanceof KnoraDate)) {
      return '';
    }

    const formatted = this.formatPattern(date, formatPattern);
    return displayOptions ? this.addDisplayOptions(date, formatted, displayOptions) : formatted;
  }

  /** the numerals alone, in the requested pattern, at the date's own precision. */
  formatPattern(date: KnoraDate, format: string | undefined): string {
    const d = this._pad(date.day);
    const m = this._pad(date.month);

    switch (format) {
      case 'dd-MM-YYYY':
        if (date.precision === 2) return `${d}-${m}-${date.year}`;
        if (date.precision === 1) return `${m}-${date.year}`;
        return `${date.year}`;
      case 'MM/dd/YYYY':
        if (date.precision === 2) return `${m}/${d}/${date.year}`;
        if (date.precision === 1) return `${m}/${date.year}`;
        return `${date.year}`;
      case 'YYYY-MM-dd':
        if (date.precision === 2) return `${date.year}-${m}-${d}`;
        if (date.precision === 1) return `${date.year}-${m}`;
        return `${date.year}`;
      case 'dd.MM.YYYY':
      default:
        if (date.precision === 2) return `${d}.${m}.${date.year}`;
        if (date.precision === 1) return `${m}.${date.year}`;
        return `${date.year}`;
    }
  }

  /**
   * appends the era, the calendar, or both.
   *
   * `gravsearch` is not a display option despite living here: it emits the literal dsp-api parses,
   * so its calendar name stays bare and untranslated. Putting a human-readable name in that branch
   * would break every date query in the app.
   */
  addDisplayOptions(date: KnoraDate, value: string, options: string): string {
    switch (options) {
      case 'era':
        return value + (date.era === 'noEra' ? '' : date.era === 'BCE' || date.era === 'AD' ? ` ${date.era}` : '');
      case 'eraWhereAmbiguous':
        // BCE always, and CE below year 1000: "450" alone is ambiguous in a corpus that also holds
        // BCE material, while "2024 CE" is noise. Islamic never shows one — it has no era.
        if (date.era === 'noEra') {
          return value;
        }
        if (date.era === 'BCE') {
          return `${value} BCE`;
        }
        return date.year < 1000 ? `${value} CE` : value;
      case 'calendar':
        return `${value} ${this.calendarName(date.calendar)}`;
      case 'calendarOnly':
        return this.calendarName(date.calendar);
      case 'gravsearch':
        return `${date.calendar}:${value}${date.era === 'BCE' ? ' BCE' : ''}`;
      case 'all':
        return `${value + (date.era === 'noEra' ? '' : date.era === 'BCE' ? ` ${date.era}` : '')} ${this.calendarName(date.calendar)}`;
      default:
        return '';
    }
  }

  /**
   * the inverse of `format(date, 'YYYY-MM-dd', 'gravsearch')`: a stored search term as a date.
   *
   * The literal names no era for Islamic, which has none; any other calendar defaults to CE.
   */
  parseGravsearchDate(literal: string): KnoraDate {
    const [calendar, dateAndEra] = literal.split(':');
    const [datePart, eraPart] = dateAndEra.split(' ');
    const [year, month, day] = datePart.split('-').map(part => parseInt(part, 10));
    const era = calendar.toUpperCase() === 'ISLAMIC' ? 'noEra' : eraPart || 'CE';

    if (day) {
      return new KnoraDate(calendar, era, year, month, day);
    }
    if (month) {
      return new KnoraDate(calendar, era, year, month);
    }
    return new KnoraDate(calendar, era, year);
  }

  /**
   * the calendar's name as a reader should see it.
   *
   * Translated, and the Islamic entry states *which* Islamic calendar this is: there are several and
   * they disagree by a day or two, so a bare "Islamic" claims more than the app can back (DEV-7429).
   */
  calendarName(calendar: string): string {
    this._language();
    const key = `ui.calendarMarker.calendars.${calendar.toUpperCase()}`;
    const translated = this._translate?.instant(key);
    return translated && translated !== key ? translated : this._titleCase(calendar);
  }

  private _pad(value: number | undefined): string {
    return value !== undefined ? `0${value}`.slice(-2) : '';
  }

  private _titleCase(str: string): string {
    return str
      .split(' ')
      .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(' ');
  }
}
