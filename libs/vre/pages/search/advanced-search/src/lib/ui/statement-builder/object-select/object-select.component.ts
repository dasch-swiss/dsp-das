import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PropertyObjectType, StatementElement } from '../../../model';
import { PropertyFormManager } from '../../../service/property-form.manager';
import { PropertyFormLinkValueComponent } from '../property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from '../property-form-list-value/property-form-list-value.component';
import { PropertyFormResourceComponent } from '../property-form-resource/property-form-resource.component';
import { PropertyFormValueComponent } from '../property-form-value/property-form-value.component';

@Component({
  selector: 'app-object-select',
  standalone: true,
  imports: [
    CommonModule,
    PropertyFormValueComponent,
    PropertyFormLinkValueComponent,
    PropertyFormListValueComponent,
    PropertyFormResourceComponent,
  ],
  template: `
    <div class="adv-statement-form right-hand-form">
      @switch (statementElement.objectType) {
        @case (PROPERTY_OBJECT_TYPES.ResourceObject) {
          <app-property-form-resource
            [availableResources]="statementElement.availableObjects"
            [selectedResource]="statementElement.selectedObjectNode?.value"
            (selectedResourceChange)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ValueObject) {
          <app-property-form-value
            [valueType]="statementElement.selectedPredicate!.objectValueType"
            [value]="statementElement.selectedObjectWriteValue"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ListValueObject) {
          <app-property-form-list-value
            [rootListNode]="statementElement.listObject"
            [selectedListNode]="statementElement.selectedObjectNode?.value"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.LinkValueObject) {
          <app-property-form-link-value
            [resourceClass]="statementElement.objectType"
            (emitResourceSelected)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.None) {
          <!-- No input needed -->
        }
      }
    </div>
  `,
  styleUrls: ['../statement-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectSelectComponent {
  @Input({ required: true }) statementElement!: StatementElement;

  formManager = inject(PropertyFormManager);

  readonly PROPERTY_OBJECT_TYPES = PropertyObjectType;
}
