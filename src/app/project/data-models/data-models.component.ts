import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ListNodeInfo, ListsResponse, OntologiesMetadata } from '@dasch-swiss/dsp-js';
import { AppInitService } from 'src/app/app-init.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/services/error-handler.service';
import { OntologyService } from '../ontology/ontology.service';

@Component({
    selector: 'app-data-models',
    templateUrl: './data-models.component.html',
    styleUrls: ['./data-models.component.scss']
})
export class DataModelsComponent implements OnInit {

    projectOntologies: OntologiesMetadata;
    projectLists: ListNodeInfo[];

    loading: boolean;
    tooltipText: string;
    isTooltipVisible: boolean;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _appInit: AppInitService,
        private _ontologyService: OntologyService
    ) { }

    ngOnInit(): void {
        this.loading = true;
        const uuid = this._route.parent.snapshot.params.uuid;
        const iri = `${this._appInit.dspAppConfig.iriBase}/projects/${uuid}`;
        this._dspApiConnection.v2.onto.getOntologiesByProjectIri(iri).subscribe(
            (ontologies: OntologiesMetadata) => {
                this.projectOntologies = ontologies;
                if(this.projectLists) {
                    this.loading = false;
                }
            }
        );

        // get all project lists
        this._dspApiConnection.admin.listsEndpoint.getListsInProject(iri).subscribe(
            (lists: ApiResponseData<ListsResponse>) => {
                this.projectLists = lists.body.lists;
                if(this.projectOntologies) {
                    this.loading = false;
                }

            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );
    }

    open(route: string, id?: string) {
        if (route === 'ontology' && id) {
            id = this._ontologyService.getOntologyName(id);
        }
        if (route === 'list' && id) {
            // get name of list
            const array = id.split('/');
            const pos = array.length - 1;
            id = array[pos];
        }
        if(id) {
            if (route === 'ontology') {
                this._router.navigate([route, encodeURIComponent(id), 'editor', 'classes'], { relativeTo: this._route.parent });
            } else {
                this._router.navigate([route, encodeURIComponent(id)], { relativeTo: this._route.parent });
            }
        } else if (route === 'docs') {
            window.open('https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model', '_blank');
        } else {
            this._router.navigate([route], { relativeTo: this._route.parent });
        }
    }

    toggleTooltip(type: string){
        switch(type) {
            case 'data-models':
                this.tooltipText = 'A data model organizes data elements and specifies how they relate to one another and by which properties they are described.';
                break;
            case 'lists':
                this.tooltipText = `Controlled vocabularies are hierarchical or non-hierarchical lexica of reference terms.
                    Due to their normative or standardized nature, controlled vocabularies improve data quality and make database searching more efficient than free-text fields.`;
                break;
        }
        console.log('text: ', this.tooltipText);
        this.isTooltipVisible = !this.isTooltipVisible;
        console.log('visible: ', this.isTooltipVisible);

    }

}
