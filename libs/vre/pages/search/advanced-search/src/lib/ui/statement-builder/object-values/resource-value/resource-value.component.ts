import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';
import { IriLabelPair, Predicate } from '../../../../model';
import { AdvancedSearchDataService } from '../../../../service/advanced-search-data.service';

@Component({
  selector: 'app-resource-value',
  standalone: true,
  imports: [CommonModule, MatSelectModule],
  template: `
    <mat-form-field class="width-100-percent">
      <mat-label>Resource Class</mat-label>
      <mat-select
        [value]="selectedResource"
        (selectionChange)="selectedResourceChange.emit($event.value)"
        data-cy="resource-class-select"
        [compareWith]="compareObjects">
        @for (resClass of availableResources$ | async; track resClass.iri) {
          <mat-option [attr.data-cy]="resClass.label" [value]="resClass">
            {{ resClass.label }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styleUrl: '../../../../advanced-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceValueComponent implements OnInit {
  private _dataService = inject(AdvancedSearchDataService);

  @Input() selectedResource?: IriLabelPair;
  @Input() selectedPredicate?: Predicate;

  @Output() selectedResourceChange = new EventEmitter<IriLabelPair>();

  availableResources$ = new BehaviorSubject<IriLabelPair[]>([]);

  ngOnInit() {
    this._dataService.getResourceClassObjectsForProperty$(this.selectedPredicate?.iri).subscribe(resources => {
      this.availableResources$.next(resources);
      if (!this.selectedPredicate && !this.selectedResource && resources.length > 0) {
        this.selectedResource = resources[0];
        this.selectedResourceChange.emit(resources[0]);
      }
    });
  }

  compareObjects(object1: IriLabelPair, object2: IriLabelPair) {
    return object1 && object2 && object1.iri === object2.iri;
  }
}
