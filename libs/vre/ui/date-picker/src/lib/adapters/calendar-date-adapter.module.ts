import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CalendarDateAdapter } from './calendar-date.adapter';
import { CALENDAR_DATE_FORMATS } from './calendar-date-formats';

/**
 * Module that provides the CalendarDateAdapter to all Material datepickers.
 * This replaces the old MatJDNConvertibleCalendarDateAdapterModule.
 */
@NgModule({
  providers: [
    {
      provide: DateAdapter,
      useClass: CalendarDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: CALENDAR_DATE_FORMATS,
    },
  ],
})
export class MatCalendarDateAdapterModule {}
