import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-text-switch',
  template: ` <app-base-switch [control]="myControl" [displayMode]="displayMode">
    <app-common-input [control]="myControl" style="width: 100%" data-cy="text-input"></app-common-input>
  </app-base-switch>`,
})
export class TextSwitchComponent implements SwitchComponent, OnInit, OnDestroy {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;

  get myControl() {
    return this.control as FormControl<string>;
  }

  subscription!: Subscription;

  ngOnInit() {
    this.subscription = this.control.valueChanges.subscribe(value => {
      if (value === '') {
        this.control.patchValue(null);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
