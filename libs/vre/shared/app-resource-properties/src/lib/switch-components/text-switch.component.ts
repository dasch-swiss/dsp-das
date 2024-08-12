import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-text-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">
      <ng-container *ngIf="mathMode; else textMode">
        <app-mathjax-paragraph [mathString]="control.value" />
      </ng-container>
    </ng-container>

    <ng-template #editMode>
      <app-common-input [control]="myControl" style="width: 100%" data-cy="text-input" label="Text value" />
    </ng-template>

    <ng-template #textMode>{{ control.value }}</ng-template>`,
})
export class TextSwitchComponent implements IsSwitchComponent, OnInit, OnDestroy {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;

  readonly mathMode = false;
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
