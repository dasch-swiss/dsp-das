import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatementElement } from '../../model';
import { PropertyFormManager } from '../../service/property-form.manager';
import { ComparisonOperatorComponent } from './assertions/comparison-operator.component';
import { ObjectSelectComponent } from './assertions/object-select.component';
import { PredicateSelectComponent } from './assertions/predicate-select.component';

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
    ObjectSelectComponent,
  ],
  template: ` @for (statementElement of statementElements; track statementElement.id; let isLast = $last) {
    <div class="width-100-percent flex gap-05em">
      <app-predicate-select
        [selectedPredicate]="statementElement.selectedPredicate"
        [subjectClass]="statementElement.parentStatementObject?.value"
        (selectedPredicateChange)="formManager.onPredicateSelectionChanged(statementElement, $event)" />
      <app-comparison-operator
        [operators]="statementElement.operators"
        [selectedOperator]="statementElement.selectedOperator"
        (operatorChange)="formManager.setSelectedOperator(statementElement, $event)" />
      <app-object-select [statementElement]="statementElement" />
      @if (!isLast && !!statementElement.selectedPredicate) {
        <button
          mat-icon-button
          (click)="formManager.deleteStatement(statementElement)"
          matTooltip="Remove search criteria">
          <mat-icon>remove_circle</mat-icon>
        </button>
      }
    </div>
  }`,
  styleUrls: ['../../advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementBuilderComponent {
  @Input({ required: true }) statementElements: StatementElement[] = [new StatementElement()];

  public formManager = inject(PropertyFormManager);
}
