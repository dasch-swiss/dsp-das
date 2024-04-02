import { Component, Inject, Input } from '@angular/core';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
import { FormBuilder } from '@angular/forms';
import { FormValueArray } from '@dasch-swiss/vre/shared/app-resource-properties';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { KnoraApiConnection, UpdateResource, UpdateResourceMetadataResponse } from '@dasch-swiss/dsp-js';
import { take } from 'rxjs/operators';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';

@Component({
  selector: 'app-display-edit-2',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      <app-switch-values *ngFor="let val of prop.values" [value]="val"></app-switch-values>
    </ng-container>
    <ng-template #editMode>
      <app-switch-properties-3
        [propertyDefinition]="prop.propDef"
        [property]="prop.guiDef"
        [cardinality]="prop.guiDef.cardinality"
        [formArray]="formArray"></app-switch-properties-3>
      <button (click)="submitData()">Edit</button>
    </ng-template>
    <button (click)="displayMode = !displayMode">TOGGLE</button>
  `,
})
export class DisplayEdit2Component {
  @Input() prop: PropertyInfoValues;
  displayMode = true;

  formArray: FormValueArray = this._fb.array([this._fb.group({ item: null, comment: '' })]);

  constructor(
    private _fb: FormBuilder,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection
  ) {}

  submitData() {
    if (this.formArray.invalid) return;

    this._dspApiConnection.v2.res
      .updateResourceMetadata(this._getPayload())
      .pipe(take(1))
      .subscribe((res: UpdateResourceMetadataResponse) => {
        console.log(res);
      });
  }

  private getValue(iri: string) {
    return this.formArray.controls.map(group => {
      const entity = propertiesTypeMapping.get(this.prop.propDef.objectType).mapping(group.controls.item.value);
      if (group.controls.comment.value) {
        entity.valueHasComment = group.controls.comment.value;
      }
      return entity;
    });
  }

  private _getPropertiesObj() {
    const propertiesObj = {};

    Object.keys(this.formArray.controls).forEach(iri => {
      propertiesObj[iri] = this.getValue(iri);
    });

    return propertiesObj;
  }

  private _getPayload() {
    const updateResource = new UpdateResource();
    updateResource.property = this.prop.propDef.id;
    updateResource.value = this.formArray.controls[0].value.item;
    return updateResource;
  }
}
