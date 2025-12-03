import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, OnChanges } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs';
import { IriLabelPair, Predicate } from '../../../model';
import { AdvancedSearchDataService } from '../../../service/advanced-search-data.service';

@Component({
  selector: 'app-predicate-select',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatSelectModule],
  template: `
    <mat-form-field class="adv-statement-form">
      <mat-label>{{ label }}</mat-label>
      <mat-select
        [value]="selectedPredicate"
        (selectionChange)="selectedPredicateChange.emit($event.value)"
        data-cy="predicate-select"
        [compareWith]="compareObjects">
        @for (prop of properties; track prop.iri) {
          <mat-option [value]="prop" [attr.data-cy]="prop.label">{{ prop.label }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredicateSelectComponent implements OnChanges {
  @Input() subjectClass?: IriLabelPair;
  @Input() selectedPredicate?: Predicate;

  @Output() selectedPredicateChange = new EventEmitter<Predicate>();

  private _dataService = inject(AdvancedSearchDataService);

  properties: Predicate[] = [];

  ngOnChanges(): void {
    console.log('PredicateSelectComponent detected changes, subjectClass:', this.subjectClass);
    this._dataService
      .getProperties$(this.subjectClass?.iri)
      .pipe(take(1))
      .subscribe(properties => {
        console.log('PredicateSelectComponent loaded properties:', properties);
        this.properties = properties;
      });
  }

  get label(): string {
    return this.subjectClass?.label ? `Select a property of ${this.subjectClass?.label}` : `Select property`;
  }

  compareObjects(object1: Predicate | IriLabelPair, object2: Predicate | IriLabelPair) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
