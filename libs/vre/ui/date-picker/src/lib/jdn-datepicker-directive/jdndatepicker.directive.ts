import { Directive, Inject, InjectionToken, Input, OnChanges, OnDestroy } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { BehaviorSubject } from 'rxjs';
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
export class JDNDatepickerDirective implements OnChanges, OnDestroy {
  private _activeCalendar!: 'Gregorian' | 'Julian' | 'Islamic';

  constructor(@Inject(ACTIVE_CALENDAR) private readonly _activeCalendarToken: BehaviorSubject<string>) {}

  get activeCalendar() {
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

  ngOnChanges(): void {
    this._activeCalendarToken.next(this.activeCalendar);
  }

  ngOnDestroy(): void {
    this._activeCalendarToken.complete();
  }
}
