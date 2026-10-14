import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { input } from '@angular/core';
import { KnoraDate, KnoraPeriod, ReadDateValue } from '@dasch-swiss/dsp-js';
import { CALENDAR_SYSTEMS, CalendarSystem } from '@dasch-swiss/vre/shared/calendar';
import { CalendarDateService } from '@dasch-swiss/vre/ui/ui';
import { CalendarFacts, CalendarMarkerComponent, CalendarReading } from '@dasch-swiss/vre/ui/ui';

/**
 * Renders a date value in the calendar it is stored in, with a marker that reads it in the others.
 *
 * The rendered date never changes. Opening the marker lists this date in all three calendars at
 * once, which is what comparing sources actually requires; re-rendering the value in a chosen
 * calendar would mean reading one at a time, and would leave a reader unsure which they were
 * looking at.
 *
 * A year or month rarely maps onto a single unit of another calendar: Julian 1582 runs into
 * Gregorian 1583. Such a reading shows the span it covers rather than one date the source never
 * specified.
 */
@Component({
  selector: 'app-date-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CalendarMarkerComponent],
  template: `
    <span data-cy="date-text">{{ storedText() }}</span>
    <span data-cy="date-switch" style="display: inline-block; margin-left: 8px">
      <app-calendar-marker
        [storedCalendar]="storedCalendar()"
        [readings]="readings()"
        [facts]="facts()"
        (opened)="hasBeenOpened.set(true)" />
    </span>
  `,
})
export class DateViewerComponent {
  readonly value = input.required<ReadDateValue>();

  private readonly _calendarDates = inject(CalendarDateService);

  /**
   * Whether the marker has been opened. A property list can hold hundreds of dates, and the
   * readings and facts are shown only in the marker's panel, so they wait for it.
   */
  protected readonly hasBeenOpened = signal(false);

  /** The calendar the value is stored in — its start, for a period, which governs both ends. */
  protected readonly storedCalendar = computed<CalendarSystem>(() => {
    const date = this.value().date;
    const stored = date instanceof KnoraPeriod ? date.start : date;
    return stored.calendar.toUpperCase() as CalendarSystem;
  });

  /** What is on the page: always the stored date, in the calendar it was recorded in. */
  protected readonly storedText = computed(() => this._readIn(this.storedCalendar()) ?? '');

  /**
   * What holds for the value itself: its weekday, its position in the day count, its length.
   *
   * Computed from the stored date rather than any conversion, because they describe the instant
   * and not a reading of it. The day numbers are always given, as the range of days the value
   * covers where that is more than one. The rest is omitted where it does not apply — a value
   * stored at year or month precision names no single day, so it has no weekday, and only a period
   * has a duration.
   */
  protected readonly facts = computed<CalendarFacts>(() => {
    if (!this.hasBeenOpened()) {
      return {};
    }
    const date = this.value().date;
    const { first: jdn, last: endJdn } = this._calendarDates.julianDayRangeOf(date);

    if (date instanceof KnoraPeriod) {
      return {
        weekday: this._calendarDates.weekdayOf(date.start),
        endWeekday: this._calendarDates.weekdayOf(date.end),
        jdn,
        endJdn,
        durationDays: this._calendarDates.durationInDays(date),
        reformGap: this._calendarDates.reformGapOf(date),
        machineReadable: this._calendarDates.machineReadableOf(date),
      };
    }
    return {
      weekday: this._calendarDates.weekdayOf(date),
      jdn,
      endJdn,
      reformGap: this._calendarDates.reformGapOf(date),
      machineReadable: this._calendarDates.machineReadableOf(date),
    };
  });

  /** This value read in each calendar, for the marker to list. */
  protected readonly readings = computed<CalendarReading[]>(() =>
    this.hasBeenOpened() ? CALENDAR_SYSTEMS.map(calendar => ({ calendar, date: this._readIn(calendar) })) : []
  );

  /**
   * The whole value as text in one calendar, or `undefined` where that calendar cannot express it.
   *
   * `undefined` is the Islamic calendar's answer for a date before the Hijra. The marker says so in
   * words rather than dropping the row, so a reader can tell "no such date" from "not shown".
   */
  private _readIn(target: CalendarSystem): string | undefined {
    const date = this.value().date;

    if (date instanceof KnoraPeriod) {
      const start = this._renderDate(date.start, target);
      const end = this._renderDate(date.end, target);
      return start && end ? `${start} – ${end}` : undefined;
    }
    return this._renderDate(date, target);
  }

  /** One date in one calendar; a span when the conversion covers a range. */
  private _renderDate(date: KnoraDate, target: CalendarSystem): string | undefined {
    if (target === date.calendar.toUpperCase()) {
      return this._format(date);
    }

    const converted = this._calendarDates.convertKnoraDateTo(date, target);
    if (converted === undefined) {
      return undefined;
    }

    return converted.end === undefined
      ? this._format(converted.start)
      : this._formatSpan(converted.start, converted.end);
  }

  /**
   * A span, with the era stated once when both ends share it.
   *
   * `1582/1583`, `754/753 BCE`, `06./07.1582` — repeating the era on both ends of a span reads as
   * two separate dates rather than one range.
   */
  private _formatSpan(start: KnoraDate, end: KnoraDate): string {
    if (start.era === end.era) {
      return `${this._format(start, false)}/${this._format(end)}`;
    }
    return `${this._format(start)}/${this._format(end)}`;
  }

  /** One date as text, with the era shown only where it carries information. */
  private _format(date: KnoraDate, withEra = true): string {
    return this._calendarDates.format(date, 'dd.MM.YYYY', withEra ? 'eraWhereAmbiguous' : undefined);
  }
}
