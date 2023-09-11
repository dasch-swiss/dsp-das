import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import {
    AdvancedSearchStoreService,
    ParentChildPropertyPair,
    OrderByItem,
    PropertyFormItem,
    PropertyFormListOperations,
    SearchItem,
} from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormComponent } from '../../ui/property-form/property-form.component';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';
import { Constants } from '@dasch-swiss/dsp-js';
import { ActivatedRoute } from '@angular/router';
import { OrderByComponent } from '../../ui/order-by/order-by.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../ui/dialog/confirmation-dialog/confirmation-dialog.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'dasch-swiss-advanced-search',
    standalone: true,
    imports: [
        CommonModule,
        OrderByComponent,
        OntologyResourceFormComponent,
        PropertyFormComponent,
        FormActionsComponent,
        MatIconModule,
    ],
    providers: [AdvancedSearchStoreService],
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedSearchComponent implements OnInit {
    // either the uuid of the project or the shortcode
    // new projects use uuid, old projects use shortcode
    @Input() uuid: string | undefined = undefined;

    @Output() emitGravesearchQuery = new EventEmitter<string>();
    @Output() emitBackButtonClicked = new EventEmitter<void>();

    store: AdvancedSearchStoreService = inject(AdvancedSearchStoreService);
    route: ActivatedRoute = inject(ActivatedRoute);

    ontologies$ = this.store.ontologies$;
    ontologiesLoading$ = this.store.ontologiesLoading$;
    resourceClasses$ = this.store.resourceClasses$;
    resourceClassesLoading$ = this.store.resourceClassesLoading$;
    selectedProject$ = this.store.selectedProject$;
    selectedOntology$ = this.store.selectedOntology$;
    selectedResourceClass$ = this.store.selectedResourceClass$;
    propertyFormList$ = this.store.propertyFormList$;
    propertiesOrderByList$ = this.store.propertiesOrderByList$;
    properties$ = this.store.properties$;
    propertiesLoading$ = this.store.propertiesLoading$;
    filteredProperties$ = this.store.filteredProperties$;
    searchButtonDisabled$ = this.store.searchButtonDisabled$;
    addButtonDisabled$ = this.store.addButtonDisabled$;
    resetButtonDisabled$ = this.store.resetButtonDisabled$;
    resourcesSearchResultsLoading$ = this.store.resourcesSearchResultsLoading$;
    resourcesSearchResultsCount$ = this.store.resourcesSearchResultsCount$;
    resourcesSearchNoResults$ = this.store.resourcesSearchNoResults$;
    resourcesSearchResultsPageNumber$ =
        this.store.resourcesSearchResultsPageNumber$;
    resourcesSearchResults$ = this.store.resourcesSearchResults$;
    orderByButtonDisabled$ = this.store.orderByButtonDisabled$;

    constants = Constants;

    constructor(private _dialog: MatDialog) {}

    ngOnInit(): void {
        this.store.setState({
            ontologies: [],
            ontologiesLoading: false,
            resourceClasses: [],
            resourceClassesLoading: false,
            selectedProject: this.uuid
                ? 'http://rdfh.ch/projects/' + this.uuid
                : undefined,
            selectedOntology: undefined,
            selectedResourceClass: undefined,
            propertyFormList: [],
            properties: [],
            propertiesLoading: false,
            propertiesOrderByList: [],
            filteredProperties: [],
            resourcesSearchResultsLoading: false,
            resourcesSearchResultsCount: 0,
            resourcesSearchNoResults: false,
            resourcesSearchResultsPageNumber: 0,
            resourcesSearchResults: [],
        });

        this.store.ontologiesList(this.selectedProject$);

        this.store.resourceClassesList(this.selectedOntology$);

        this.store.propertiesList(this.selectedOntology$);

        this.store.filteredPropertiesList(this.selectedResourceClass$);
    }

    // pass-through method to notify the store to update the state of the selected ontology
    handleSelectedOntology(ontology: ApiData): void {
        this.store.updateSelectedOntology(ontology);
    }

    // pass-through method to notify the store to update the state of the selected resource class
    handleSelectedResourceClass(resourceClass: ApiData): void {
        this.store.updateSelectedResourceClass(resourceClass);
    }

    handleAddPropertyForm(): void {
        const uuid = uuidv4();

        this.store.updatePropertyFormList(PropertyFormListOperations.Add, {
            id: uuid,
            selectedProperty: undefined,
            selectedOperator: undefined,
            searchValue: undefined,
            operators: [],
            list: undefined,
        });
    }

    handleRemovePropertyForm(property: PropertyFormItem): void {
        this.store.updatePropertyFormList(
            PropertyFormListOperations.Delete,
            property
        );
    }

    handleSelectedPropertyChanged(property: PropertyFormItem): void {
        if (
            property.selectedProperty?.objectType !== Constants.Label &&
            !property.selectedProperty?.objectType.includes(
                this.constants.KnoraApiV2
            )
        ) {
            // reset the search results
            this.store.resetResourcesSearchResults();
        }
        this.store.updateSelectedProperty(property);
    }

    handleSelectedOperatorChanged(property: PropertyFormItem): void {
        this.store.updateSelectedOperator(property);
    }

    handleSearchValueChanged(property: PropertyFormItem): void {
        this.store.updateSearchValue(property);
    }

    handleResourceSearchValueChanged(searchItem: SearchItem): void {
        this.store.updateResourcesSearchResults(searchItem);
    }

    handleLoadMoreSearchResults(searchItem: SearchItem): void {
        this.store.loadMoreResourcesSearchResults(searchItem);
    }

    handlePropertyOrderByChanged(orderByList: OrderByItem[]): void {
        this.store.updatePropertyOrderBy(orderByList);
    }

    handleSearchButtonClicked(): void {
        this.emitGravesearchQuery.emit(this.store.onSearch());
    }

    handleResetButtonClicked(): void {
        const dialogRef = this._dialog.open(ConfirmationDialogComponent, {});

        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.store.onReset();
            }
        });
    }

    handleBackButtonClicked(): void {
        this.emitBackButtonClicked.emit();
    }

    handleAddChildPropertyForm(property: PropertyFormItem): void {
        this.store.addChildPropertyFormList(property);
    }

    handleRemoveChildPropertyForm(property: ParentChildPropertyPair): void {
        this.store.deleteChildPropertyFormList(property);
    }

    handleChildSelectedPropertyChanged(property: ParentChildPropertyPair): void {
        this.store.updateChildSelectedProperty(property);
    }

    handleChildSelectedOperatorChanged(property: ParentChildPropertyPair): void {
        this.store.updateChildSelectedOperator(property);
    }

    handleChildValueChanged(property: ParentChildPropertyPair): void {
        this.store.updateChildSearchValue(property);
    }
}
