import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-rich-text-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">{{ control.value }}</ng-container>
    <ng-template #editMode>
      <app-rich-text-value [control]="myControl"></app-rich-text-value>
    </ng-template>`,
})
export class RichTextSwitchComponent implements IsSwitchComponent, OnInit, OnDestroy {
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
