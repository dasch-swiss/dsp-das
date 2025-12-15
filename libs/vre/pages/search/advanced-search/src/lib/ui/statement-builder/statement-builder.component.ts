import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertyObjectType, StatementElement } from '../../model';
import { PropertyFormManager } from '../../service/property-form.manager';
import { ComparisonOperatorComponent } from './assertions/comparison-operator.component';
import { PredicateSelectComponent } from './assertions/predicate-select.component';
import { LinkValueComponent } from './object-values/link-value/link-value.component';
import { ListValueComponent } from './object-values/list-value/list-value.component';
import { ResourceValueComponent } from './object-values/resource-value/resource-value.component';
import { StringValueComponent } from './object-values/string-value/string-value.component';

@Component({
  selector: 'app-statement-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PredicateSelectComponent,
    ComparisonOperatorComponent,
    LinkValueComponent,
    ListValueComponent,
    ResourceValueComponent,
    StringValueComponent,
  ],
  template: ` @for (statementElement of statementElements; track statementElement.id; let isLast = $last) {
    <div class="width-100-percent flex gap-05em" [style.margin-left.em]="(statementElement.statementLevel + 1) * 2">
      <app-predicate-select
        [style.width]="'calc(30% - ' + (statementElement.statementLevel + 1) * 2 + 'em)'"
        [selectedPredicate]="statementElement?.selectedPredicate"
        [subjectClass]="statementElement.selectedSubjectNode?.value"
        (selectedPredicateChange)="formManager.onPredicateSelectionChanged(statementElement, $event)" />
      <app-comparison-operator
        [operators]="statementElement.operators"
        [selectedOperator]="statementElement.selectedOperator"
        (operatorChange)="formManager.setSelectedOperator(statementElement, $event)" />
      @switch (statementElement.objectType) {
        @case (PROPERTY_OBJECT_TYPES.ResourceObject) {
          <app-resource-value
            class="width-40-percent"
            [selectedPredicate]="statementElement.selectedPredicate"
            [selectedResource]="statementElement.selectedObjectNode?.value"
            (selectedResourceChange)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ValueObject) {
          <app-string-value
            class="width-40-percent"
            [valueType]="statementElement.selectedPredicate!.objectValueType"
            [value]="statementElement.selectedObjectWriteValue"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.ListValueObject) {
          <app-list-value
            class="width-40-percent"
            [rootListNodeIri]="statementElement.selectedPredicate!.listObjectIri"
            (emitValueChanged)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.LinkValueObject) {
          <app-link-value
            class="width-40-percent"
            [resourceClass]="statementElement.selectedPredicate?.objectValueType"
            (emitResourceSelected)="formManager.setObjectValue(statementElement, $event)" />
        }
        @case (PROPERTY_OBJECT_TYPES.None) {
          <!-- No input needed -->
        }
      }
      @if (!statementElement.isPristine && !isLast) {
        <button
          mat-icon-button
          (click)="formManager.deleteStatement(statementElement)"
          matTooltip="Remove search criteria">
          <mat-icon>remove_circle</mat-icon>
        </button>
      }
      @if (!statementElement.isValidAndComplete && !statementElement.isPristine && isLast) {
        <button
          mat-icon-button
          (click)="formManager.clearStatementElement(statementElement)"
          matTooltip="Clear selection">
          <mat-icon>replay</mat-icon>
        </button>
      }
    </div>
  }`,
  styleUrl: '../../advanced-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementBuilderComponent implements OnChanges {
  @Input({ required: true }) statementElements: StatementElement[] = [new StatementElement()];

  formManager = inject(PropertyFormManager);

  protected readonly PROPERTY_OBJECT_TYPES = PropertyObjectType;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['statementElements']) {
      console.log('changes statementElements');
      console.log(this.statementElements);
    }
  }
}
