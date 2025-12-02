import { CalendarDate } from '@dasch-swiss/vre/shared/calendar';

export class DateTime {
  constructor(
    public date: CalendarDate,
    public time: string
  ) {}
}
