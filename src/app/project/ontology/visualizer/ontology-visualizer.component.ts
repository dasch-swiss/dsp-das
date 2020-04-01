import {Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
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

    nodes = [];
    links = [];
    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _router: Router,
        private _ontologyService: OntologyService) { }

    isInNodes(item: string) {
        for (const node of this.nodes) {
            if (node['id'] === item) {
                return true;
            }
        }
        return false;
    }
    getSubclassLinksAndExternalResources(res: ClassDefinition): void {
        for (const item of res.subClassOf) {
            if (!this.isInNodes(item)) {
                this.nodes.push({'id': item, 'label': item, 'group': 'resource', 'class': 'external'});
            }
            const link = {'source': res.id, 'target': item, 'label': 'subClassOf'};
            this.links.push(link);
        }
    }
    addOntoClassesToNodes() {
        for (const res of this.ontoClasses) {
            const node = {'id': res.id, 'label': res.label, 'group': 'resource', 'class': 'native'}
            this.nodes.push(node);
        }
    }
    addObjectTypeToNodes(target: string, propID: string) {
        // object Value is a literal
        if (target.endsWith('Value')) {
            const label = target.split('#', 2)[1];
            const literalNode = {'id': propID + '_' + label, 'label': label, 'group': 'literal',  'class': label};
            this.nodes.push(literalNode);
        // object Value is a resource defined in another ontology
        } else if (!this.isInNodes(target)) {
            this.nodes.push({'id': target, 'label': target, 'group': 'resource', 'class': 'external'});
        }

    }
    convertOntolologytoGraph() {
        this.addOntoClassesToNodes();
        for (const res of this.ontoClasses) {
            this.getSubclassLinksAndExternalResources(res);
            for (const prop of res.propertiesList) {
                if (prop.guiOrder >= 0 && this.ontology.properties[prop.propertyIndex] && this.ontology.properties[prop.propertyIndex].objectType !== 'http://api.knora.org/ontology/knora-api/v2#LinkValue') {
                    const target = this.ontology.properties[prop.propertyIndex].objectType;
                    const proplabel = this.ontology.properties[prop.propertyIndex].label;
                    this.addObjectTypeToNodes(target, prop.propertyIndex)
                    const link = {'source': res.id, 'target': target, 'label': proplabel}
                    this.links.push(link);

                }
            }
        }
        console.log('nodes');
        console.log(this.nodes);
        console.log('links');
        console.log(this.links);
    }
    ngOnInit() {
        this.convertOntolologytoGraph();
    }

    visualizeOntology() {
        this.loading = true;
    }



}
