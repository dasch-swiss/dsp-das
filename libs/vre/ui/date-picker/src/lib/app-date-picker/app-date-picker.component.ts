import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Output,
  Self,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  FormsModule,
  NgControl,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  _AbstractConstructor,
  _Constructor,
  CanUpdateErrorState,
  ErrorStateMatcher,
  MatOptionModule,
  mixinErrorState,
} from '@angular/material/core';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { KnoraDate } from '@dasch-swiss/dsp-js';
import {
  CalendarDate,
  CalendarPeriod,
  GregorianCalendarDate,
  IslamicCalendarDate,
  JulianCalendarDate,
} from '@dasch-swiss/jdnconvertiblecalendar';
import { Subject } from 'rxjs';

/** error when invalid control is dirty, touched, or submitted. */
export class DatePickerErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

type CanUpdateErrorStateCtor = _Constructor<CanUpdateErrorState> & _AbstractConstructor<CanUpdateErrorState>;

interface FormErrors {
  [key: string]: string;
}

interface ValidationMessages {
  [key: string]: {
    [key: string]: string;
  };
}

class MatInputBase {
  constructor(
    public _defaultErrorStateMatcher: ErrorStateMatcher,
    public _parentForm: NgForm,
    public _parentFormGroup: FormGroupDirective,
    public ngControl: NgControl,
    public stateChanges: Subject<void>
  ) {}
}

const _MatInputMixinBase: CanUpdateErrorStateCtor & typeof MatInputBase = mixinErrorState(MatInputBase);

@Component({
  selector: 'app-date-picker',
  templateUrl: './app-date-picker.component.html',
  styleUrls: ['./app-date-picker.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatOptionModule,
    MatMenuModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatSelectModule,
  ],
})
export class AppDatePickerComponent
  extends _MatInputMixinBase
  implements ControlValueAccessor, MatFormFieldControl<KnoraDate>, OnChanges, DoCheck, CanUpdateErrorState, OnDestroy
{
  static nextId = 0;

  @ViewChild(MatMenuTrigger) popover!: MatMenuTrigger;
  @Output() datePickerClosed: EventEmitter<void> = new EventEmitter();
  @Output() emitDateChanged: EventEmitter<string> = new EventEmitter();
  @Input() override errorStateMatcher!: ErrorStateMatcher;

  // disable calendar selector in case of end date in a period date value
  @Input() disableCalendarSelector!: boolean;

  // set predefinde calendar
  @Input() calendar = 'GREGORIAN';

  @HostBinding()
  id = `app-date-picker-${AppDatePickerComponent.nextId++}`;

  @HostBinding('attr.aria-describedby') describedBy = '';
  dateForm: UntypedFormGroup;
  focused = false;
  override errorState = false;
  controlType = 'app-date-picker';
  matcher = new DatePickerErrorStateMatcher();

  // own date picker variables
  date!: KnoraDate;
  form!: UntypedFormGroup;

  formErrors: FormErrors = {
    year: '',
  };

  validationMessages: ValidationMessages = {
    year: {
      required: 'At least the year has to be set.',
      min: 'A valid year is greater than 0.',
    },
  };

  // list of months
  months = [
    ['Jan', 'Muḥarram'],
    ['Feb', 'Safar'],
    ['Mar', 'Rabīʿ al-ʾAwwal'],
    ['Apr', 'Rabīʿ ath-Thānī'],
    ['May', 'Jumadā al-ʾŪlā'],
    ['Jun', 'Jumādā ath-Thāniyah'],
    ['Jul', 'Rajab'],
    ['Aug', 'Shaʿbān'],
    ['Sep', 'Ramaḍān'],
    ['Oct', 'Shawwāl'],
    ['Nov', 'Ḏū al-Qaʿdah'],
    ['Dec', 'Ḏū al-Ḥijjah'],
  ];

  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  weeks: number[][] = [];
  days: number[] = [];
  day: number | undefined;
  month!: number;
  year!: number;

  disableDaySelector!: boolean;

  calendars = ['GREGORIAN', 'JULIAN', 'ISLAMIC'];

  era = 'CE';
  // ------

  private _required = false;
  private _disabled = false;
  private _placeholder!: string;

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input()
  get required() {
    return this._required;
  }

  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this._disabled ? this.dateForm.disable() : this.dateForm.enable();
    this.stateChanges.next();
  }

  @Input()
  get placeholder() {
    return this._placeholder;
  }

  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }

  @Input()
  get value(): KnoraDate | null {
    const dateValue = this.dateForm.value;
    if (dateValue !== null) {
      return dateValue.knoraDate;
    }
    return null;
  }

  set value(dateValue: KnoraDate | null) {
    if (dateValue !== null && dateValue instanceof KnoraDate) {
      this.dateForm.setValue({
        date: this.transform(dateValue, 'dd.MM.YYYY', 'era'),
        knoraDate: dateValue,
      });
      this.calendar = dateValue.calendar;
      this.era = this.calendar === 'ISLAMIC' ? 'noEra' : dateValue.era === 'noEra' ? 'CE' : dateValue.era;

      this.day = dateValue.day;
      this.month = dateValue.month ? dateValue.month : 0;
      this.year = dateValue.year;
      this.emitDateChanged.emit(this.transform(dateValue, 'YYYY-MM-dd', 'gravsearch'));
    } else {
      this.dateForm.setValue({ date: null, knoraDate: null });
    }

    this.stateChanges.next();
    this.buildForm();
  }

  get empty() {
    const dateInput = this.dateForm.value;
    return !dateInput.knoraDate;
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  constructor(
    _defaultErrorStateMatcher: ErrorStateMatcher,
    @Optional() _parentForm: NgForm,
    @Optional() _parentFormGroup: FormGroupDirective,
    @Optional() @Self() public override ngControl: NgControl,
    private _stateChanges: Subject<void>,
    fb: UntypedFormBuilder,
    private _elRef: ElementRef<HTMLElement>,
    private _fm: FocusMonitor
  ) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl, _stateChanges);

    this.dateForm = fb.group({
      date: [null, Validators.required],
      knoraDate: [null, Validators.required],
    });

    _fm.monitor(_elRef.nativeElement, true).subscribe(origin => {
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    // will be replaced by calendar and era
    this.placeholder = 'Click to select a date';

    this.buildForm();

    this.dateForm.valueChanges.subscribe(() => this.handleInput());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  onChange = (_: any) => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges) {
    // in case the calendar has changed (from parent e.g. in a period)
    // update the calendar form control
    if (changes['calendar'] && this.disableCalendarSelector) {
      this._updateForm();
    }
  }

  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elRef.nativeElement.querySelector('input')?.focus();
    }
  }

  writeValue(dateValue: KnoraDate | null): void {
    this.value = dateValue;
  }

  transform(
    date: KnoraDate,
    format?: string,
    displayOptions?: 'era' | 'calendar' | 'calendarOnly' | 'gravsearch' | 'all'
  ): string {
    if (!(date instanceof KnoraDate)) {
      // console.error('Non-KnoraDate provided. Expected a valid KnoraDate');
      return '';
    }

    const formattedString = this.getFormattedString(date, format);

    if (displayOptions) {
      return this.addDisplayOptions(date, formattedString, displayOptions);
    } else {
      return formattedString;
    }
  }

  getFormattedString(date: KnoraDate, format: string | undefined): string {
    switch (format) {
      case 'dd.MM.YYYY':
        if (date.precision === 2) {
          return `${this.leftPadding(date.day)}.${this.leftPadding(date.month)}.${date.year}`;
        } else if (date.precision === 1) {
          return `${this.leftPadding(date.month)}.${date.year}`;
        } else {
          return `${date.year}`;
        }
      case 'dd-MM-YYYY':
        if (date.precision === 2) {
          return `${this.leftPadding(date.day)}-${this.leftPadding(date.month)}-${date.year}`;
        } else if (date.precision === 1) {
          return `${this.leftPadding(date.month)}-${date.year}`;
        } else {
          return `${date.year}`;
        }
      case 'MM/dd/YYYY':
        if (date.precision === 2) {
          return `${this.leftPadding(date.month)}/${this.leftPadding(date.day)}/${date.year}`;
        } else if (date.precision === 1) {
          return `${this.leftPadding(date.month)}/${date.year}`;
        } else {
          return `${date.year}`;
        }
      case 'YYYY-MM-dd':
        if (date.precision === 2) {
          return `${date.year}-${this.leftPadding(date.month)}-${this.leftPadding(date.day)}`;
        } else if (date.precision === 1) {
          return `${date.year}-${this.leftPadding(date.month)}`;
        } else {
          return `${date.year}`;
        }
      default:
        if (date.precision === 2) {
          return `${this.leftPadding(date.day)}.${this.leftPadding(date.month)}.${date.year}`;
        } else if (date.precision === 1) {
          return `${this.leftPadding(date.month)}.${date.year}`;
        } else {
          return `${date.year}`;
        }
    }
  }

  leftPadding(value: number | undefined): string {
    if (value !== undefined) {
      return `0${value}`.slice(-2);
    } else {
      return '';
    }
  }

  addDisplayOptions(date: KnoraDate, value: string, options: string): string {
    let era: string;

    switch (options) {
      case 'era':
        // displays date with era; era only in case of BCE
        return value + (date.era === 'noEra' ? '' : date.era === 'BCE' || date.era === 'AD' ? ` ${date.era}` : '');
      case 'calendar':
        // displays date without era but with calendar type
        return `${value} ${this.titleCase(date.calendar)}`;
      case 'calendarOnly':
        // displays only the selected calendar type without any data
        return this.titleCase(date.calendar);
      case 'gravsearch':
        // GREGORIAN:2023-8-2
        // CE is default era so no need to add it
        era = date.era === 'BCE' ? ' BCE' : '';
        return `${date.calendar}:${value}${era}`;
      case 'all':
        // displays date with era (only as BCE) and selected calendar type
        return `${value + (date.era === 'noEra' ? '' : date.era === 'BCE' ? ` ${date.era}` : '')} ${this.titleCase(
          date.calendar
        )}`;
      default:
        return '';
    }
  }

  /**
   * returns a string in Title Case format
   * It's needed to transform a calendar name e.g. 'GREGORIAN' into 'Gregorian'
   *
   * @param str
   * @returns string
   */
  titleCase(str: string): string {
    return str
      .split(' ')
      .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
      .join(' ');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput() {
    this.onChange(this.value);
  }

  buildForm() {
    this.form = new UntypedFormGroup({
      calendar: new UntypedFormControl(),
      era: new UntypedFormControl(''),
      year: new UntypedFormControl('', [Validators.required, Validators.min(1)]),
      month: new UntypedFormControl(''),
    });

    this.disableDaySelector = this.month === 0;

    if (this.value) {
      this._updateForm();
    } else if (!this.disableCalendarSelector) {
      this.setToday();
    }

    this.form.valueChanges.subscribe(data => this.onValueChanged(data));
  }

  /**
   * this method is for the form error handling
   *
   * @param data Data which changed.
   */
  onValueChanged(data?: any) {
    if (!this.form) {
      return;
    }

    this.calendar = this.form.controls['calendar'].value;

    this.era =
      this.calendar === 'ISLAMIC' ? 'noEra' : this.form.controls['era'].value ? this.form.controls['era'].value : 'CE';
    // islamic calendar doesn't have a "before common era"
    // in case of switching calendar from islamic to gregorian or julian set default era value to CE
    if (this.calendar !== 'ISLAMIC' && this.era === 'noEra') {
      this.form.controls['era'].setValue('CE');
    }

    if (data.year > 0) {
      if (data.month) {
        // give possibility to select day;
        this.disableDaySelector = false;
        // set the corresponding days
        this._setDays(this.calendar, this.era, data.year, data.month);
      } else {
        // set precision to year only; disable the day selector
        this.disableDaySelector = true;
        this.day = undefined;
      }
    } else {
      // not valid form; disable the day selector
      this.disableDaySelector = true;
      this.day = undefined;
    }

    const form = this.form;

    Object.keys(this.formErrors).forEach((field: string) => {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid && control.errors !== null) {
        const messages = this.validationMessages[field];
        Object.keys(control.errors).forEach((key: string) => {
          this.formErrors[field] += `${messages[key]} `;
        });
      }
    });

    this.setDate(this.day);
  }

  setDate(day?: number) {
    // set date on year, on year and month or on year, month and day precision
    if (this.form.controls['year'].value > 0 && this.form.valid) {
      this.day = day;
      this.date = new KnoraDate(
        this.calendar.toUpperCase(),
        this.era,
        this.form.controls['year'].value,
        this.form.controls['month'].value ? this.form.controls['month'].value : undefined,
        day || undefined
      );

      this.value = this.date;
    }
  }

  setToday() {
    const today = new Date();

    let day: number;
    let month: number;
    let year: number;

    let islamicDay: string;
    let islamicMonth: string;
    let islamicYear: string;

    let julianDate: Date;
    let difference: number;

    this.era = 'CE';

    switch (this.calendar) {
      // islamic calendar
      case 'ISLAMIC':
        // found solution and formula here:
        // https://medium.com/@Saf_Bes/get-today-hijri-date-in-javascript-90855d3cd45b
        islamicDay = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
          day: 'numeric',
        }).format(today);
        islamicMonth = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
          month: 'numeric',
        }).format(today);
        islamicYear = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
          year: 'numeric',
        }).format(today);
        day = parseInt(islamicDay, 10);
        month = parseInt(islamicMonth, 10);
        year = parseInt(islamicYear.substring(0, 4), 10);
        this.era = 'noEra';
        break;

      // julian calendar
      case 'JULIAN':
        // found solution and formula here:
        // https://sciencing.com/convert-julian-date-calender-date-6017669.html
        julianDate = new Date();
        difference = parseInt(`${julianDate.getFullYear()}`.substring(0, 2), 10) * 0.75 - 1.25;
        julianDate.setDate(julianDate.getDate() - Math.floor(difference));
        day = julianDate.getDate();
        month = julianDate.getMonth() + 1;
        year = julianDate.getFullYear();
        break;

      // gregorian calendar
      default:
        day = today.getDate();
        month = today.getMonth() + 1;
        year = today.getFullYear();
    }

    this.day = day;
    this.month = month;
    this.year = year;
    this._updateForm();
  }

  closeDatePicker() {
    if (this.popover) {
      this.popover.closeMenu();
    }
  }

  private _updateForm() {
    this.form.setValue({
      calendar: this.calendar,
      era: this.era,
      year: this.year,
      month: this.month,
    });
    if (this.disableCalendarSelector) {
      this.form.controls['calendar'].disable();
    } else {
      this.form.controls['calendar'].enable();
    }
    this._setDays(this.calendar, this.era, this.year, this.month);
  }

  /**
   * given a historical date (year), returns the astronomical year.
   *
   * @param year year of the given date.
   * @param era era of the given date.
   */
  convertHistoricalYearToAstronomicalYear(year: number, era: string) {
    let yearAstro = year;
    if (era === 'BCE') {
      // convert historical date to astronomical date
      yearAstro = yearAstro * -1 + 1;
    }
    return yearAstro;
  }

  /**
   * calculates the number of days in a month for a given year.
   *
   * @param calendar the date's calendar.
   * @param year the date's year.
   * @param month the date's month.
   */
  calculateDaysInMonth(calendar: string, year: number, month: number): number {
    const date = new CalendarDate(year, month, 1);
    if (calendar === 'GREGORIAN') {
      const calDate = new GregorianCalendarDate(new CalendarPeriod(date, date));
      return calDate.daysInMonth(date);
    } else if (calendar === 'JULIAN') {
      const calDate = new JulianCalendarDate(new CalendarPeriod(date, date));
      return calDate.daysInMonth(date);
    } else if (calendar === 'ISLAMIC') {
      const calDate = new IslamicCalendarDate(new CalendarPeriod(date, date));
      return calDate.daysInMonth(date);
    } else {
      throw Error(`Unknown calendar ${calendar}`);
    }
  }

  /**
   * sets available days for a given year and month.
   *
   * @param calendar calendar of the given date.
   * @param era era of the given date.
   * @param year year of the given date.
   * @param month month of the given date.
   */
  private _setDays(calendar: string, era: string, year: number, month: number) {
    const yearAstro = this.convertHistoricalYearToAstronomicalYear(year, era);

    // count the days of the month
    let days = this.calculateDaysInMonth(calendar.toUpperCase(), yearAstro, month);

    // calculate the week day and the position of the first day of the month
    // if date is before October 4th 1582, we should use the julian date converter for week day
    let firstDayOfMonth: number;

    const h = month <= 2 ? month + 12 : month;
    const k = month <= 2 ? year - 1 : year;

    // calculate weekday of the first the of the month;
    // found solution and formular here:
    // https://straub.as/java/basic/kalender.html
    if (year < 1582 || (year === 1582 && month <= 10) || calendar === 'JULIAN') {
      // get the day of the week by using the julian date converter independet from selected calendar
      firstDayOfMonth = (1 + 2 * h + Math.floor((3 * h + 3) / 5) + k + Math.floor(k / 4) - 1) % 7;
    } else {
      // firstDayOfMonth = new Date(year, month - 1, 1).getDay();
      firstDayOfMonth =
        (1 +
          2 * h +
          Math.floor((3 * h + 3) / 5) +
          k +
          Math.floor(k / 4) -
          Math.floor(k / 100) +
          Math.floor(k / 400) +
          1) %
        7;
    }

    // empty array of the days
    this.days = [];

    // if first day of the month is sunday (0)
    // move it to the end of the week (7)
    // because the first column is prepared for Monday
    if (firstDayOfMonth === 0) {
      firstDayOfMonth = 7;
    }

    // if era is not before common era, we support
    // week days. The following loop helps to set
    // position of the first day of the month
    if (era === 'CE') {
      for (let i = 1; i < firstDayOfMonth; i++) {
        this.days.push(0);
      }
    }

    // prepare list of the days
    for (let i = 1; i <= days; i++) {
      // special case for October 1582, which had only 21 days instead of 31
      // because of the change from julian to gregorian calendar
      if (calendar === 'GREGORIAN' && year === 1582 && month === 10 && i === 5 && era === 'CE') {
        i = 15;
        days = 31;
      }
      this.days.push(i);
    }

    // split the list of the days in to
    // list of days per week corresponding to the week day
    const dates = this.days;
    const weeks = [];
    while (dates.length > 0) {
      weeks.push(dates.splice(0, 7));
    }
    this.weeks = weeks;
  }
}
