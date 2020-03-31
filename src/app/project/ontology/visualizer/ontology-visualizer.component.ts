import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { existingNamesValidator } from '@knora/action';
import {ApiResponseData, ApiResponseError, ClassDefinition, KnoraApiConnection, ProjectResponse, ReadOntology, ReadProject} from '@knora/api';
import { KnoraApiConnectionToken, OntologyService, ApiServiceError, ApiServiceResult } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';

export interface NewOntology {
    projectIri: string;
    name: string;
    label: string;
}

@Component({
    selector: 'app-ontology-visualizer',
    templateUrl: './ontology-visualizer.component.html',
    styleUrls: ['./ontology-visualizer.component.scss']
})
export class OntologyVisualizerComponent implements OnInit {

    loading: boolean;
    // ontology JSON-LD object
    @Input() ontology: ReadOntology;
    @Input() ontologyIri: string = undefined;
    @Input() ontoClasses: ClassDefinition[];

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _router: Router,
        private _ontologyService: OntologyService) { }

    convertJSONLDtoGraph() {
    }
    ngOnInit() {
        this.convertJSONLDtoGraph();
    }

    visualizeOntology() {
        this.loading = true;
    }



}
