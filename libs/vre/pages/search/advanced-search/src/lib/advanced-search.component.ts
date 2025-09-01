import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '@dasch-swiss/dsp-js';
import { AppConfigService, DspAppConfig } from '@dasch-swiss/vre/core/config';
import { DialogService } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { AdvancedSearchStateSnapshot, PropertyFormItem, QueryObject } from './model';
import { SearchStateService } from './service/search-state.service';
import { FormActionsComponent } from './ui/form-actions/form-actions.component';
import { OntologyResourceFormComponent } from './ui/ontology-resource-form/ontology-resource-form.component';
import { OrderByComponent } from './ui/order-by/order-by.component';
import { PropertyFormSubcriteriaComponent } from './ui/property-form/property-form-subcriteria/property-form-subcriteria.component';
import { PropertyFormComponent } from './ui/property-form/property-form.component';
import { INITIAL_FORMS_STATE } from './util';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [
    CommonModule,
    OrderByComponent,
    OntologyResourceFormComponent,
    PropertyFormComponent,
    PropertyFormSubcriteriaComponent,
    FormActionsComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    TranslateModule,
  ],
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchComponent implements OnInit {
  @Input({ required: true }) projectUuid!: string;

  @Output() emitGravesearchQuery = new EventEmitter<QueryObject>();

  private readonly IRI_BASE = 'http://rdfh.ch/projects/';

  private _searchState: SearchStateService = inject(SearchStateService);
  route: ActivatedRoute = inject(ActivatedRoute);

  propertyFormList$ = this._searchState.propertyForms$;

  constants = Constants;
  previousSearchObject: AdvancedSearchStateSnapshot | null = null;

  constructor(private _dialogService: DialogService) {}

  ngOnInit(): void {
    const projectIri = `${this.IRI_BASE}${this.projectUuid}`;
    this._searchState.initWithProject(projectIri);
    const searchStored = localStorage.getItem('advanced-search-previous-search') || '{}';
    this.previousSearchObject = JSON.parse(searchStored)[projectIri];
  }

  handleRemovePropertyForm(property: PropertyFormItem): void {
    this._searchState.deletePropertyForm(property);
  }

  handleSearchButtonClicked(): void {
    this.propertyFormList$.pipe(take(1)).subscribe(propertyFormList => {
      // Filter out empty property forms (forms without a selected property)
      const nonEmptyProperties = propertyFormList.filter(prop => prop.selectedProperty);

      const queryObject: QueryObject = {
        query: this._searchState.onSearch(),
        properties: nonEmptyProperties,
      };

      this.emitGravesearchQuery.emit(queryObject);
    });
  }

  handleResetButtonClicked(): void {
    this._dialogService.afterConfirmation('Are you sure you want to reset the form?').subscribe(() => {
      this._searchState.reset();
    });
  }
  loadPreviousSearch(): void {
    if (!this.previousSearchObject) return;

    this._searchState.setState({
      ...INITIAL_FORMS_STATE,
      ...this.previousSearchObject,
    });
  }

  // Get the list of child properties of a linked resource
  getLinkMatchPropertyFormItems(value: string | PropertyFormItem[]): PropertyFormItem[] {
    return Array.isArray(value) ? value : [];
  }
}
