import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntologyResourceFormComponent } from '../../ui/ontology-resource-form/ontology-resource-form.component';
import { AdvancedSearchStoreService } from '../../data-access/advanced-search-store/advanced-search-store.service';

@Component({
    selector: 'dasch-swiss-advanced-search',
    standalone: true,
    imports: [CommonModule, OntologyResourceFormComponent],
    providers: [AdvancedSearchStoreService],
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
})
export class AdvancedSearchComponent implements OnInit {

    store: AdvancedSearchStoreService = inject(AdvancedSearchStoreService);

    ontologies$ = this.store.ontologies$;

    ngOnInit(): void {
        this.store.setState({
            ontologies: ['onto1', 'onto2', 'onto3'],
        });
    }
}
