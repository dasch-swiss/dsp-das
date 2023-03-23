import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const ACTIVE_CALENDAR = new InjectionToken<
  BehaviorSubject<'Gregorian' | 'Julian' | 'Islamic'>
>('Active Calendar');
