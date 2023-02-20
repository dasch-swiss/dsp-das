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
        let name;

        if (route === 'ontology' && id) {
            // get name of ontology
            name = this._ontologyService.getOntologyName(id);
        }
        if (route === 'list' && id) {
            // get name of list
            const array = id.split('/');
            const pos = array.length - 1;
            name = array[pos];
        }
        if(name) {
            if (route === 'ontology') {
                // route to the onto editor
                this._router.navigate([route, encodeURIComponent(name), 'editor', 'classes'], { relativeTo: this._route.parent });
            } else {
                // route to the list editor
                this._router.navigate([route, encodeURIComponent(name)], { relativeTo: this._route.parent });
            }
        } else if (route === 'docs') {
            // route to the external docs
            window.open('https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model', '_blank');
        } else {
            // fallback default routing
            this._router.navigate([route], { relativeTo: this._route.parent });
        }
    }

}
