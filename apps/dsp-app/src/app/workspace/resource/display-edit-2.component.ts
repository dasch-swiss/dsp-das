import { Component, Input } from '@angular/core';
import { PropertyInfoValues } from '@dsp-app/src/app/workspace/resource/properties/properties.component';
import { FormBuilder } from '@angular/forms';
import { FormValueArray } from '../../../../../../libs/vre/shared/app-resource-properties/src/lib/form-value-array.type';

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
    </ng-template>
    <button (click)="displayMode = !displayMode">TOGGLE</button>
  `,
})
export class DisplayEdit2Component {
  @Input() prop: PropertyInfoValues;
  displayMode = true;

  formArray: FormValueArray = this._fb.array([this._fb.group({ item: null, comment: '' })]);

  constructor(private _fb: FormBuilder) {}
}
