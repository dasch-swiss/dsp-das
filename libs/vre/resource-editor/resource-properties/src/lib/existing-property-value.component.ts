import { Component, Input, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FootnoteService } from './footnote.service';
import { FormValueArray } from './form-value-array.type';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-existing-property-value',
  template: `
    <app-property-value-switcher-2 [myProperty]="prop" [editMode]="false" (templateFound)="template = $event" />

    <app-property-value-switcher
      *ngIf="resource.type && template"
      [myProperty]="prop"
      [formArray]="formArray"
      [resourceClassIri]="resource.type"
      [itemTpl]="template"
      [editModeData]="{ resource, values: prop.values }" />

    <app-footnotes *ngIf="footnoteService.footnotes.length > 0" />
  `,
  styles: [':host { display: block; position: relative; width: 100%}'],
  providers: [FootnoteService],
})
export class ExistingPropertyValueComponent implements OnChanges {
  @Input({ required: true }) prop!: PropertyInfoValues;
  @Input({ required: true }) resource!: ReadResource;

  template?: TemplateRef<any>;
  formArray!: FormValueArray;

  constructor(
    private _fb: FormBuilder,
    public footnoteService: FootnoteService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['prop']) {
      this.footnoteService.reset();
    }

    this.formArray = this._fb.array(
      this.prop.values.map(value => {
        const property = propertiesTypeMapping.get(this.prop.propDef.objectType!);
        if (property === undefined) {
          throw new Error(`The property of type ${this.prop.propDef.objectType} is unknown`);
        }
        return this._fb.group({
          item: property.control(value) as AbstractControl,
          comment: this._fb.control(value?.valueHasComment ?? null),
        });
      })
    );
  }
}
