import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { PropertyValueService } from './property-value.service';

@Component({
  selector: 'app-property-values',
  template: ` <div
      *ngFor="let group of propertyValueService.formArray.controls; let index = index"
      style="display: flex">
      <app-property-value style="width: 100%" [itemTpl]="itemTpl" [index]="index"></app-property-value>
    </div>
    <button
      mat-icon-button
      (click)="addItem()"
      *ngIf="
        (!propertyValueService.currentlyAdding || propertyValueService.keepEditMode) &&
        (propertyValueService.formArray.controls.length === 0 ||
          [Cardinality._0_n, Cardinality._1_n].includes(propertyValueService.cardinality))
      ">
      <mat-icon>add_box</mat-icon>
    </button>`,
})
export class PropertyValuesComponent implements OnInit {
  @Input() itemTpl!: TemplateRef<any>;

  protected readonly Cardinality = Cardinality;

  constructor(
    public propertyValueService: PropertyValueService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    if (!this.propertyValueService.formArray || this.propertyValueService.formArray.length === 0) {
      throw new Error('The form array should not be empty.');
    }
  }

  addItem() {
    this.propertyValueService.formArray.push(
      this._fb.group({
        item: propertiesTypeMapping
          .get(this.propertyValueService.propertyDefinition.objectType)
          .control() as AbstractControl,
        comment: this._fb.control(''),
      })
    );
    this.propertyValueService.toggleOpenedValue(this.propertyValueService.formArray.length - 1);
    this.propertyValueService.currentlyAdding = true;
  }
}