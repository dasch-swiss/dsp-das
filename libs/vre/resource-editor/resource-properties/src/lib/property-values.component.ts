import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { ResourceUtil } from '@dasch-swiss/vre/resource-editor/representations';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { JsLibPotentialError } from './JsLibPotentialError';
import { FormValueArray } from './form-value-array.type';
import { PropertyValueService } from './property-value.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-values',
  template: ` <app-property-value
      *ngFor="let group of propertyValueService.formArray.controls; let index = index"
      [index]="index"
      style="width: 100%" />

    <button
      mat-icon-button
      (click)="addItem()"
      data-cy="add-property-value-button"
      *ngIf="userCanAdd && !propertyValueService.currentlyAdding && matchesCardinality">
      <mat-icon class="add-icon">add_box</mat-icon>
    </button>`,
  styles: [
    `
      .add-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
  providers: [PropertyValueService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValuesComponent implements OnInit {
  @Input({ required: true }) formArray!: FormValueArray;
  @Input({ required: true }) editModeData!: { resource: ReadResource; values: ReadValue[] };
  @Input({ required: true }) myProperty!: PropertyInfoValues;

  protected readonly Cardinality = Cardinality;

  get userCanAdd() {
    return ResourceUtil.userCanEdit(this.editModeData.resource);
  }

  get matchesCardinality() {
    return (
      this.propertyValueService.formArray.controls.length === 0 ||
      [Cardinality._0_n, Cardinality._1_n].includes(this.propertyValueService.cardinality)
    );
  }

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  constructor(
    public propertyValueService: PropertyValueService,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this._setupData();
  }

  addItem() {
    this.propertyValueService.test = 'new value changed';
    const formGroup = this._fb.group({
      item: propertiesTypeMapping
        .get(this.propertyValueService.propertyDefinition.objectType!)!
        .control() as AbstractControl,
      comment: this._fb.control(''),
    });

    const array = this.propertyValueService.formArray;
    array.push(formGroup);
    this.propertyValueService.formArray = array;

    this.propertyValueService.formArray.updateValueAndValidity();
    console.log('in prop values', this.propertyValueService.formArray);

    this.propertyValueService.toggleOpenedValue(this.propertyValueService.formArray.length - 1);
    this.propertyValueService.currentlyAdding = true;
  }

  private _setupData() {
    this.propertyValueService.editModeData = this.editModeData;
    this.propertyValueService.propertyDefinition = this.propertyDefinition;
    this.propertyValueService.formArray = this.formArray;
    this.propertyValueService.cardinality = this.myProperty.guiDef.cardinality;
  }
}
