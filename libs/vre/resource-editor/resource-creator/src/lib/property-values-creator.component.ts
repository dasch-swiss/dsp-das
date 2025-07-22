import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { FormValueArray, propertiesTypeMapping } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-property-values-creator',
  template: `
    <app-template-editor-switcher
      [myPropertyDefinition]="myProperty.propDef"
      [resourceClassIri]="resourceClassIri"
      (templateFound)="templateFound($event)" />

    <app-property-value-creator
      *ngFor="let control of formArray.controls"
      [myProperty]="myProperty"
      [formArray]="control"
      [template]="template" />

    <button
      mat-icon-button
      type="button"
      *ngIf="
        (myProperty.guiDef.cardinality === Cardinality._0_n || myProperty.guiDef.cardinality === Cardinality._1_n) &&
        formArray.controls[formArray.controls.length - 1].value.item !== null
      "
      (click)="addEntry()"
      [matTooltip]="'Add new value'">
      <mat-icon>add_circle</mat-icon>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValuesCreatorComponent implements OnInit {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueArray;
  @Input({ required: true }) resourceClassIri!: string;

  template!: TemplateRef<any>;
  Cardinality = Cardinality;

  constructor(
    private _cd: ChangeDetectorRef,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    console.log(this.formArray.controls[this.formArray.controls.length - 1].value.item);
  }

  templateFound(template: TemplateRef<any>) {
    this.template = template;
    this._cd.detectChanges();
  }

  addEntry() {
    const formGroup = this._fb.group({
      item: propertiesTypeMapping.get(this.myProperty.propDef.objectType!)!.control() as AbstractControl,
      comment: this._fb.control(null),
    });

    this.formArray.push(formGroup);
  }
}
