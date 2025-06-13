import { Component, Input, TemplateRef } from '@angular/core';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { FormValueArray } from './form-value-array.type';

@Component({
  selector: 'app-property-value-creator',
  template: `
    <app-template-editor-switcher
      [myPropertyDefinition]="myProperty.propDef"
      [value]="myProperty.values[0]"
      (templateFound)="template = $event" />

    <ng-container *ngIf="template">
      <ng-container *ngTemplateOutlet="template; context: { item: formArray.at(0).controls.item }"></ng-container>
    </ng-container>
  `,
})
export class PropertyValueCreatorComponent {
  @Input({ required: true }) myProperty!: PropertyInfoValues;
  @Input({ required: true }) formArray!: FormValueArray;

  template?: TemplateRef<any>;
}
