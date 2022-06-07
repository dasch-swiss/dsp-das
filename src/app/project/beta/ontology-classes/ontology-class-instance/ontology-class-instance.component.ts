import { Component, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OntologyService } from 'src/app/project/ontology/ontology.service';
import { SearchParams } from 'src/app/workspace/results/list-view/list-view.component';

@Component({
    selector: 'app-ontology-class-instance',
    templateUrl: './ontology-class-instance.component.html',
    styleUrls: ['./ontology-class-instance.component.scss']
})
export class OntologyClassInstanceComponent implements OnChanges {

    projectId: string;

    classId: string;

    instanceId: string;

    searchParams: SearchParams;

    constructor(
        private _route: ActivatedRoute,
        private _ontologyService: OntologyService
    ) {

        // parameters from the url
        const projectCode = this._route.parent.snapshot.params.shortcode;

        this.projectId = `http://rdfh.ch/projects/${projectCode}`;

        this._route.params.subscribe(params => {
            const iriBase = this._ontologyService.getIriBaseUrl();

            const ontologyName = params['onto'];
            const className = params['class'];

            // get the resource class id from route
            this.classId = `${iriBase}/ontology/${projectCode}/${ontologyName}/v2#${className}`;

            this.instanceId = params['instance'];
            if (this.instanceId) {
                // single instance

                if (this.instanceId === 'add') {
                    // create new res class instance: display res instance form
                }
            } else {
                this.searchParams = {
                    query: this._setGravsearch(this.classId),
                    mode: 'gravsearch'
                };
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {

        // this.reset();
        console.log('something has changed',);

    }



    private _setGravsearch(iri: string): string {
        return `
        PREFIX knora-api: <http://api.knora.org/ontology/knora-api/v2#>
        CONSTRUCT {

        ?mainRes knora-api:isMainResource true .

        } WHERE {

        ?mainRes a knora-api:Resource .

        ?mainRes a <${iri}> .

        }

        OFFSET 0`;
    }

}
