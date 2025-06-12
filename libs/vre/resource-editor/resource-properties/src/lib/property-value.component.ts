import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormValueGroup } from './form-value-array.type';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value',
  template: `
    <app-property-value-display [index]="index" *ngIf="displayMode" />
    <app-property-value-edit [index]="index" [group]="group" *ngIf="!displayMode" />
  `,
})
export class PropertyValueComponent implements OnInit, OnDestroy {
  @Input({ required: true }) index!: number;
  @Input({ required: true }) group!: FormValueGroup;

  displayMode!: boolean;
  subscription!: Subscription;
  readonly Cardinality = Cardinality;

  constructor(public propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this._setupDisplayMode();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private _setupDisplayMode() {
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      if (this.propertyValueService.currentlyAdding && !this.displayMode) {
        this.propertyValueService.formArray.removeAt(this.propertyValueService.formArray.length - 1);
        this.propertyValueService.currentlyAdding = false;
        return;
      }

      if (value === null && this.propertyValueService.formArray.length > 0) {
        this.propertyValueService.formArray.at(this.index).patchValue(this.initialFormValue);
      }

      this.displayMode = this.index !== value;
    });
  }
}
