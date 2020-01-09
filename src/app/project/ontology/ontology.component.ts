import { CacheService } from 'src/app/main/cache/cache.service';

import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
    Component, ComponentFactoryResolver, Directive, OnInit, ViewChild, ViewContainerRef, Inject
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Session, KnoraApiConnectionToken } from '@knora/core';
import { ApiServiceError, ApiServiceResult, OntologyService } from '@knora/core';

import { AddSourceTypeComponent } from './add-source-type/add-source-type.component';
import { ResourceTypeComponent } from './resource-type/resource-type.component';
import { ReadProject, KnoraApiConnection, ApiResponseData, ProjectResponse, ApiResponseError } from '@knora/api';

@Directive({
    selector: '[add-host]'
})
export class AddToDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}

export interface OntologyInfo {
    id: string;
    label: string;
    project: string;
}

@Component({
    selector: 'app-ontology',
    templateUrl: './ontology.component.html',
    styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnInit {

    // loading for progess indicator
    loading: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin: boolean = false;
    projectAdmin: boolean = false;

    // project shortcode; as identifier in project cache service
    projectcode: string;

    // project data
    project: ReadProject;

    // ontologies
    ontologies: OntologyInfo[];

    // ontology JSON-LD object
    ontology: any;

    // selected ontology
    ontologyIri: string = undefined;

    sourcetypes = ['Text', 'Image', 'Video'];

    filterargs = { '@type': 'owl:Class' };

    @ViewChild('ontologyEditor', { read: ViewContainerRef, static: false }) ontologyEditor: ViewContainerRef;

    @ViewChild(AddToDirective, { static: false }) addToHost: AddToDirective;

    @ViewChild('addSourceTypeComponent', { static: false }) addSourceType: AddSourceTypeComponent;

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _ontologyService: OntologyService,
        private _cache: CacheService,
        private _titleService: Title,
        private _route: ActivatedRoute,
        private _componentFactoryResolver: ComponentFactoryResolver) {

        // get the shortcode of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectcode = params.get('shortcode');
        });

        // get ontology iri from route
        if (this._route.snapshot && this._route.snapshot.params.id) {
            this.ontologyIri = decodeURIComponent(this._route.snapshot.params.id);
        }

        // set the page title
        if (this.ontologyIri) {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Data model');
        } else {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Data models');
        }
    }

    ngOnInit() {
        this.loading = true;

        // get information about the logged-in user
        this.session = JSON.parse(localStorage.getItem('session'));
        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // default value for projectAdmin
        this.projectAdmin = this.sysAdmin;

        // set the cache
        this._cache.get(this.projectcode, this.knoraApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode));

        // get the project data from cache
        this._cache.get(this.projectcode, this.knoraApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode)).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                this.project = response.body.project;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin ? this.sysAdmin : this.session.user.projectAdmin.some(e => e === this.project.id);

                // get the ontologies for this project
                // get the ontologies for this project
                this._ontologyService.getProjectOntologies(encodeURI(this.project.id)).subscribe(
                    (ontologies: ApiServiceResult) => {

                        if (ontologies.body['@graph'] && ontologies.body['@graph'].length > 0) {

                            this.ontologies = [];

                            for (const ontology of ontologies.body['@graph']) {
                                const info: OntologyInfo = {
                                    id: ontology['@id'],
                                    label: ontology['rdfs:label'],
                                    project: ontology['knora-api:attachedToProject']['@id']
                                };

                                this.ontologies.push(info);
                            }

                            this.loading = false;

                        } else if (ontologies.body['@id'] && ontologies.body['rdfs:label']) {
                            // only one ontology
                            this.ontologies = [
                                {
                                    id: ontologies.body['@id'],
                                    label: ontologies.body['rdfs:label'],
                                    project: ontologies.body['knora-api:attachedToProject']['@id']
                                }
                            ];

                            this.ontologyIri = ontologies.body['@id'];

                            // console.log('ontology id from main comp', this.ontologyIri)
                            this.getOntology(this.ontologyIri);

                            this.loading = false;
                        } else {
                            // none ontology defined yet
                            this.ontologies = [];
                            this.loading = false;
                        }
                    },
                    (error: ApiServiceError) => {
                        console.error(error);
                    }
                );

                if (this.ontologyIri !== undefined) {
                    this.getOntology(this.ontologyIri);
                }

                this.loading = false;
            },
            (error: ApiResponseError) => {
                console.error(error);
                this.loading = false;
            }
        );
    }

    drop(event: CdkDragDrop<string[]>) {
        console.log(event);
    }

    addResourceType(id: string) {
        console.log(id);
        // this.ontologyEditor.nativeElement.insertAdjacentHTML('beforeend', ``);
        // this.appendComponentToBody(SelectListComponent);
    }

    loadComponent() {
        const componentFactory = this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);
        // this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);

        // const viewContainerRef = this.ontologyEditor.
        // viewContainerRef.clear();

        this.ontologyEditor.createComponent(componentFactory);
    }

    /**
 * refresh list of members after adding a new user to the team
 */
    refresh(): void {
        // referesh the component
        this.loading = true;

        // do something

        if (this.addSourceType) {
            this.addSourceType.buildForm();
        }

        this.loading = false;

        // update the cache

        //        this._cache.del('members_of_' + this.projectcode);

        //        this.initList();

        // refresh child component: add user
        /*
                if (this.addUser) {
                    this.addUser.buildForm();
                }
                */
    }

    getOntology(id?: string) {

        if (!id) {
            return;
        }

        this.loading = true;

        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(id));
        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(id)).subscribe(
            (ontologyResponse: any) => {
                this.ontology = ontologyResponse.body;
                this.ontologyIri = ontologyResponse.body['@id'];
                // console.log(this.ontology);
                this.loading = false;
            },
            (error: any) => {
                // console.error(error);
            }
        );

    }

    resetOntology(id: string) {
        this._cache.del('currentOntology');
        this.getOntology(id);
    }

    filterOwlClass(owlClass: any) {
        console.log(owlClass);
        return (owlClass['@type'] === 'owl:class');
    }


}
