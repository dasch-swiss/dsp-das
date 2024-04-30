import { Component, Input, OnChanges } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { filter } from 'rxjs/operators';
import { FormValueArray } from './form-value-array.type';
import { ResourceClassIriService } from './resource-class-iri.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-existing-property-value',
  template: `
    <app-property-value-switcher
      *ngIf="resourceClassIri$ | async as resClassIri"
      [myProperty]="prop"
      [formArray]="formArray"
      [resourceClassIri]="resClassIri"
      [editModeData]="{ resource, values: prop.values }"></app-property-value-switcher>
  `,
  providers: [ResourceClassIriService],
  styles: [':host { display: block; position: relative; width: 100%}'],
})
export class ExistingPropertyValueComponent implements OnChanges {
  @Input() prop!: PropertyInfoValues;
  @Input() resource!: ReadResource;

  formArray!: FormValueArray;

  constructor(
    private _fb: FormBuilder,
    public resourceClassIriService: ResourceClassIriService
  ) {}

  resourceClassIri$ = this.resourceClassIriService.resourceClassIriFromParamSubject
    .asObservable()
    .pipe(filter(v => v !== null));

  ngOnChanges() {
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
