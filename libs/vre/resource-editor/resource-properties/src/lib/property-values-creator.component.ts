import { ChangeDetectorRef, Component, Input, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FormValueArray } from './form-value-array.type';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-values-creator',
  template: `
    <app-template-editor-switcher
      [myPropertyDefinition]="myProperty.propDef"
      [value]="myProperty.values[0]"
      (templateFound)="templateFound($event)" />

    <app-property-value-creator
      *ngFor="let control of formArray.controls"
      [myProperty]="myProperty"
      [formArray]="control"
      [template]="template" />

    <button
      mat-icon-button
      *ngIf="myProperty.guiDef.cardinality === Cardinality._0_n || myProperty.guiDef.cardinality === Cardinality._1_n"
      (click)="addEntry()">
      <mat-icon>add_box</mat-icon>
    </button>
  `,
})
export class PropertyValuesCreatorComponent {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueArray;

  template!: TemplateRef<any>;
  Cardinality = Cardinality;

  constructor(
    private _cd: ChangeDetectorRef,
    private _fb: FormBuilder
  ) {}

  templateFound(template: TemplateRef<any>) {
    this.template = template;
    this._cd.detectChanges();
  }

  addEntry() {
    const formGroup = this._fb.group({
      item: propertiesTypeMapping.get(this.myProperty.propDef.objectType!)!.control() as AbstractControl,
      comment: this._fb.control(''),
    });

    this.formArray.push(formGroup);
  }
}
