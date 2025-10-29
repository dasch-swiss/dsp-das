import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { IriLabelPair } from '../../../../model';

@Component({
  selector: 'app-resource-value',
  standalone: true,
  imports: [MatSelectModule],
  template: `
    <mat-form-field>
      <mat-label>Resource Class</mat-label>
      <mat-select
        [value]="selectedResource"
        (selectionChange)="selectedResourceChange.emit($event.value)"
        data-cy="resource-class-select"
        [compareWith]="compareObjects">
        @for (resClass of availableResources; track resClass.iri) {
          <mat-option [attr.data-cy]="resClass.label" [value]="resClass">
            {{ resClass.label }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceValueComponent {
  @Input() selectedResource?: IriLabelPair;
  @Input() availableResources: IriLabelPair[] = [];

  @Output() selectedResourceChange = new EventEmitter<IriLabelPair>();

  compareObjects(object1: any, object2: any) {
    return object1 && object2 && object1.iri === object2.iri;
  }
}
