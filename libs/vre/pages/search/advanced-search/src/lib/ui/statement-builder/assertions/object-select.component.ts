import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { PropertyObjectType, StatementElement } from '../../../model';
import { PropertyFormManager } from '../../../service/property-form.manager';
import { LinkValueComponent } from '../object-values/link-value/link-value.component';
import { ListValueComponent } from '../object-values/list-value/list-value.component';
import { ResourceValueComponent } from '../object-values/resource-value/resource-value.component';
import { StringValueComponent } from '../object-values/string-value/string-value.component';

@Component({
  selector: 'app-object-select',
  standalone: true,
  imports: [CommonModule, StringValueComponent, LinkValueComponent, ListValueComponent, ResourceValueComponent],
  template: `
    <div class="adv-statement-form right-hand-form">
      @switch (statementElement.objectType) {
        @case (PROPERTY_OBJECT_TYPES.ResourceObject) {
          <app-resource-value
            [availableResources]="statementElement.availableObjects"
            [selectedResource]="statementElement.selectedObjectNode?.value"
            (selectedResourceChange)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ValueObject) {
          <app-string-value
            [valueType]="statementElement.selectedPredicate!.objectValueType"
            [value]="statementElement.selectedObjectWriteValue"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ListValueObject) {
          <app-list-value
            [rootListNode]="statementElement.listObject"
            [selectedListNode]="statementElement.selectedObjectNode?.value"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.LinkValueObject) {
          <app-link-value
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
