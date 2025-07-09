import { Injectable } from '@angular/core';
import { filter, map, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComponentCommunicationEventService {
  // create a subject to hold data which can be subscribed to.
  // you only get the data after you subscribe.
  private _subject$ = new Subject();

  // used in the listening component.
  // i.e. this.componentCommunicationEventService = this._componentCommunicationEventService.on(Events.loginSuccess, () => doSomething());
  on(events: Events[], action: () => void): Subscription {
    return this._subject$
      .pipe(
        // filter down based on event name to any events that are emitted out of the subject from the emit method below.
        filter((e: EmitEvent) => events.includes(e.name) && (e.value == null || e.value === true)) as any,
        map((e: EmitEvent) => e.value)
      )
      .subscribe(action); // subscribe to the subject to get the data.
  }

  // used in the emitting component.
  // i.e. this.componentCommunicationEventService.emit(new EmitEvent(Events.loginSuccess));
  emit(event: EmitEvent) {
    this._subject$.next(event);
  }
}

export class EmitEvent {
  constructor(
    public name: any,
    public value?: any
  ) {}
}

// possible events that can be emitted.
export enum Events {
  loginSuccess,
  gravSearchExecuted,
  unselectedListItem,
}
