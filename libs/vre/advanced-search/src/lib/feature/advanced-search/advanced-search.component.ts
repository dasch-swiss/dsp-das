import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService } from '../../data-access/advanced-search-store/advanced-search-store.service';
import { FormActionsComponent } from '../../ui/form-actions/form-actions.component';

@Component({
    selector: 'dasch-swiss-advanced-search',
    standalone: true,
    imports: [CommonModule, OntologyResourceFormComponent, FormActionsComponent],
    providers: [AdvancedSearchStoreService],
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent implements OnInit {

    store: AdvancedSearchStoreService = inject(AdvancedSearchStoreService);

    ontologies$ = this.store.ontologies$;
    resourceClasses$ = this.store.resourceClasses$;
    selectedOntology$ = this.store.selectedOntology$;
    selectedResourceClass$ = this.store.selectedResourceClass$;
    searchButtonDisabled$ = this.store.searchButtonDisabled$;

    ngOnInit(): void {
        this.store.setState({
            ontologies: ['onto1', 'onto2', 'onto3'],
            resourceClasses: ['res1', 'res2', 'res3'],
            selectedOntology: undefined,
            selectedResourceClass: undefined,
        });
    }

    handleSelectedOntology(ontology: string): void {
        this.store.updateSelectedOntology(ontology);
    }

    handleSelectedResourceClass(resourceClass: string): void {
        this.store.updateSelectedResourceClass(resourceClass);
    }

}
