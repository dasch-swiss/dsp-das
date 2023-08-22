import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService, ChildPropertyItem, OrderByItem, PropertyFormItem, SearchItem } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { PropertyFormComponent } from '../../ui/property-form/property-form.component';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';
import { ApiData } from '../../data-access/advanced-search-service/advanced-search.service';
import { Constants } from '@dasch-swiss/dsp-js';
import { ActivatedRoute } from '@angular/router';
import { OrderByComponent } from '../../ui/order-by/order-by.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../ui/dialog/confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'dasch-swiss-advanced-search',
    standalone: true,
    imports: [CommonModule, OrderByComponent, OntologyResourceFormComponent, PropertyFormComponent, FormActionsComponent, MatIconModule],
    providers: [AdvancedSearchStoreService],
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    resourcesSearchResultsPageNumber$ = this.store.resourcesSearchResultsPageNumber$;
    resourcesSearchResults$ = this.store.resourcesSearchResults$;
    orderByButtonDisabled$ = this.store.orderByButtonDisabled$;

    constants = Constants;

    constructor(private _dialog: MatDialog) { }

    ngOnInit(): void {

        // if a uuid is not provided, try to get it from the route
        // maybe this is too smart because it knows about the route structure of the app
        // but if you route directly to this component, there's no other way to pass the uuid
        if(!this.uuid) {
            const uuidFromRoute = this.route.snapshot.parent?.params['uuid'];
            if(uuidFromRoute) {
                this.uuid = uuidFromRoute;
            }
        }

        this.store.setState({
            ontologies: [],
            ontologiesLoading: false,
            resourceClasses: [],
            resourceClassesLoading: false,
            selectedProject: this.uuid ? 'http://rdfh.ch/projects/' + this.uuid : undefined,
            selectedOntology: undefined,
            selectedResourceClass: undefined,
            propertyFormList: [],
            properties: [],
            propertiesLoading: false,
            propertiesOrderByList: [],
            filteredProperties: [],
            resourcesSearchResultsLoading: false,
            resourcesSearchResultsCount: 0,
            resourcesSearchResultsPageNumber: 0,
            resourcesSearchResults: [],
        });

        // BEOL: yTerZGyxjZVqFMNNKXCDPF
        // Eric: GRlCJl3iSW2JeIt3V22rPA
        // this.store.ontologiesList('http://rdfh.ch/projects/yTerZGyxjZVqFMNNKXCDPF');
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
        // mock uuid using timestamp
        const uuid = Date.now().toString();

        this.store.updatePropertyFormList('add', { id: uuid, selectedProperty: undefined, selectedOperator: undefined, searchValue: undefined, operators: [], list: undefined });
    }

    handleRemovePropertyForm(property: PropertyFormItem): void {
        this.store.updatePropertyFormList('delete', property);
    }

    handleSelectedPropertyChanged(property: PropertyFormItem): void {
        if(property.selectedProperty?.objectType !== Constants.Label &&
            !property.selectedProperty?.objectType.includes(this.constants.KnoraApiV2)) {
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
            if(result) {
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

    handleRemoveChildPropertyForm(property: ChildPropertyItem): void {
        this.store.deleteChildPropertyFormList(property);
    }

    handleChildSelectedPropertyChanged(property: ChildPropertyItem): void {
        this.store.updateChildSelectedProperty(property);
    }

    handleChildSelectedOperatorChanged(property: ChildPropertyItem): void {
        this.store.updateChildSelectedOperator(property);
    }

    handleChildValueChanged(property: ChildPropertyItem): void {
        this.store.updateChildValue(property);
    }

}
