import { DatePipe } from '@angular/common';
import { CalendarDate, createDate } from '@dasch-swiss/vre/shared/calendar';
import { DateTime } from './date-time';

function userInputToTimestamp(userInput: DateTime): string {
  const splitTime = userInput.time.split(':');

  // in a Javascript Date, the month is 0-based so we need to subtract 1
  const updateDate = new Date(
    userInput.date.year,
    userInput.date.month! - 1,
    userInput.date.day!,
    Number(splitTime[0]),
    Number(splitTime[1])
  );

  return `${updateDate.toISOString().split('.')[0]}Z`;
}

export function dateTimeTimestamp(date: CalendarDate, time: string) {
  const userInput = new DateTime(date, time);
  return userInputToTimestamp(userInput);
}

export function convertTimestampToDateTime(timestamp: string, datePipe: DatePipe): DateTime {
  const date = createDate(
    'GREGORIAN',
    Number(datePipe.transform(timestamp, 'y')),
    Number(datePipe.transform(timestamp, 'M')),
    Number(datePipe.transform(timestamp, 'd'))
  );
  const time = datePipe.transform(timestamp, 'HH:mm');

  return new DateTime(date, time!);
}
