import { Component, Input, OnInit } from '@angular/core';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormValueGroup } from './form-value-array.type';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-value',
  template: `
    <app-property-value-display [index]="index" *ngIf="displayMode === true" />
    <app-property-value-edit [index]="index" [group]="group" *ngIf="displayMode === false" />
  `,
})
export class PropertyValueComponent implements OnInit {
  @Input({ required: true }) index!: number;
  @Input({ required: true }) group!: FormValueGroup;

  displayMode?: boolean;
  readonly Cardinality = Cardinality;

  initialFormValue!: { item: any; comment: string | null };

  constructor(public propertyValueService: PropertyValueService) {}

  ngOnInit() {
    this._setupDisplayMode();
    this._setInitialValue();
  }

  private _setInitialValue() {
    this.initialFormValue = this.group.getRawValue();
  }

  private _setupDisplayMode() {
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      if (this.propertyValueService.currentlyAdding && this.displayMode === false) {
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
