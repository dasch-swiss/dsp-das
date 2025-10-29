import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IriLabelPair, Predicate, StatementElement, PropertyObjectType } from '../../model';
import { AdvancedSearchDataService } from '../../service/advanced-search-data.service';
import { PropertyFormManager } from '../../service/property-form.manager';
import { PropertyFormLinkValueComponent } from './property-form-link-value/property-form-link-value.component';
import { PropertyFormListValueComponent } from './property-form-list-value/property-form-list-value.component';
import { PropertyFormResourceComponent } from './property-form-resource/property-form-resource.component';
import { PropertyFormValueComponent } from './property-form-value/property-form-value.component';

@Component({
  selector: 'app-statement-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTooltipModule,
    PropertyFormValueComponent,
    PropertyFormLinkValueComponent,
    PropertyFormListValueComponent,
    PropertyFormResourceComponent,
  ],
  templateUrl: './statement-builder.component.html',
  styleUrls: ['./statement-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementBuilderComponent {
  @Input() statementElement: StatementElement = new StatementElement();

  private _dataService = inject(AdvancedSearchDataService);
  public formManager = inject(PropertyFormManager);

  get predicateSelectionLabel(): string {
    return this.statementElement.parentStatementObject?.value?.label
      ? `Select a property of ${this.statementElement.parentStatementObject?.value?.label}`
      : `Select property`;
  }

  properties$ = this._dataService.availableProperties$;

  readonly PROPERTY_OBJECT_TYPES = PropertyObjectType;

  compareObjects(object1: Predicate | IriLabelPair, object2: Predicate | IriLabelPair) {
    return object1 && object2 && object1.iri == object2.iri;
  }
}
