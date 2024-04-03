import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { KnoraApiConnection, ReadResource, UpdateResource, UpdateValue, WriteValueResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { FormValueArray } from '@dasch-swiss/vre/shared/app-resource-properties';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-display-edit-2',
  template: `
    <ng-container *ngIf="displayMode; else editMode">
      <app-switch-values *ngFor="let val of prop.values" [value]="val"></app-switch-values>
    </ng-container>
    <ng-template #editMode>
      <app-switch-properties-3
        *ngIf="!loading; else loadingTemplate"
        [propertyDefinition]="prop.propDef"
        [property]="prop.guiDef"
        [cardinality]="prop.guiDef.cardinality"
        [canUpdateForm]="true"
        [formArray]="formArray"
        (updatedIndex)="updatedIndex($event)"></app-switch-properties-3>
    </ng-template>
    <button (click)="toggleDisplayMode()">TOGGLE</button>
    <ng-template #loadingTemplate>
      <dasch-swiss-app-progress-indicator></dasch-swiss-app-progress-indicator>
    </ng-template>
  `,
})
export class DisplayEdit2Component {
  @Input() prop: PropertyInfoValues;
  @Input() resource: ReadResource;
  displayMode = true;
  loading = false;

  formArray: FormValueArray;

  constructor(
    private _fb: FormBuilder,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cdr: ChangeDetectorRef
  ) {}

  toggleDisplayMode() {
    if (!this.displayMode) {
      this.displayMode = true;
      return;
    }

    this.formArray = this._fb.array(
      this.prop.values.map(value =>
        this._fb.group({
          item: propertiesTypeMapping.get(this.prop.propDef.objectType).control(value.strval) as AbstractControl,
          comment: this._fb.control(value.valueHasComment),
        })
      )
    );

    this.displayMode = false;
  }

  updatedIndex(index: number) {
    const group = this.formArray.at(index);
    if (group.invalid) return;

    this.loading = true;

    this._dspApiConnection.v2.values
      .updateValue(this._getPayload(index))
      .pipe(
        take(1),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((res: WriteValueResponse) => {
        this.displayMode = true;
        this._cdr.detectChanges();
        console.log(this, 'a');
      });
  }

  private _getUpdatedValue(index: number) {
    const group = this.formArray.at(index);
    const id = this.prop.values[index].id;
    const entity = propertiesTypeMapping.get(this.prop.propDef.objectType).updateMapping(id, group.controls.item.value);
    if (group.controls.comment.value) {
      entity.valueHasComment = group.controls.comment.value;
    }
    return entity;
  }

  private _getPayload(index: number) {
    const updateResource = new UpdateResource<UpdateValue>();
    updateResource.id = this.resource.id;
    updateResource.property = this.prop.values[index].property;
    updateResource.type = this.resource.type;
    updateResource.value = this._getUpdatedValue(index);
    return updateResource;
  }
}
