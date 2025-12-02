import { Directive, Inject, InjectionToken, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
import { CalendarDate, CalendarSystem } from '@dasch-swiss/vre/shared/calendar';
import { CalendarDateAdapter } from '../adapters/calendar-date.adapter';

export const ACTIVE_CALENDAR = new InjectionToken<BehaviorSubject<string>>('ACTIVE_CALENDAR');

export function makeCalendarToken() {
  return new BehaviorSubject('Gregorian');
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'app-jdn-datepicker',
  providers: [
    {
      provide: DateAdapter,
      useClass: CalendarDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: ACTIVE_CALENDAR, useFactory: makeCalendarToken },
  ],
  standalone: true,
})
export class JDNDatepickerDirective implements OnInit, OnChanges, OnDestroy {
  private _activeCalendar: 'Gregorian' | 'Julian' | 'Islamic' = 'Gregorian';

  constructor(
    @Inject(ACTIVE_CALENDAR) private readonly _activeCalendarToken: BehaviorSubject<string>,
    private readonly _dateAdapter: DateAdapter<CalendarDate>
  ) {
    // Set initial calendar system immediately in constructor
    // This must happen before Angular Material tries to use the adapter
    this._updateAdapterCalendar();
  }

  get activeCalendar(): 'Gregorian' | 'Julian' | 'Islamic' {
    return this._activeCalendar;
  }

  @Input()
  set activeCalendar(value: 'Gregorian' | 'Julian' | 'Islamic' | null) {
    if (value !== null && value !== undefined) {
      this._activeCalendar = value;
    } else {
      this._activeCalendar = 'Gregorian';
    }
  }

  ngOnInit(): void {
    // Set initial calendar system on the adapter
    this._updateAdapterCalendar();
  }

  ngOnChanges(): void {
    this._activeCalendarToken.next(this.activeCalendar);
    // Update the adapter whenever the calendar changes
    this._updateAdapterCalendar();
  }

  private _updateAdapterCalendar(): void {
    const calendarSystem = this._activeCalendar.toUpperCase() as CalendarSystem;
    if (this._dateAdapter instanceof CalendarDateAdapter) {
      this._dateAdapter.setCalendarSystem(calendarSystem);
    }
  }

  ngOnDestroy(): void {
    this._activeCalendarToken.complete();
  }
}
