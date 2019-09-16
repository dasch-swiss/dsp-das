import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, ComponentFactoryResolver, Directive, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Session } from '@knora/authentication';
import { ApiServiceError, ApiServiceResult, OntologyService, Project, ProjectsService } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';
import { AddSourceTypeComponent } from './add-source-type/add-source-type.component';
import { ResourceTypeComponent } from './resource-type/resource-type.component';

@Directive({
    selector: '[add-host]'
})
export class AddToDirective {
    constructor (public viewContainerRef: ViewContainerRef) { }
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
    project: Project;

    // ontologies
    ontologies: OntologyInfo[] = [];

    // ontology JSON-LD object
    ontology: any;

    // selected ontology
    ontologyIri: string = undefined;

    sourcetypes = ['Text', 'Image', 'Video'];

    @ViewChild('ontologyEditor', { read: ViewContainerRef, static: false }) ontologyEditor: ViewContainerRef;

    @ViewChild(AddToDirective, { static: false }) addToHost: AddToDirective;

    @ViewChild('addSourceTypeComponent', { static: false }) addSourceType: AddSourceTypeComponent;

    constructor (private _cache: CacheService,
        private _projectsService: ProjectsService,
        private _ontologyService: OntologyService,
        private _titleService: Title,
        private _route: ActivatedRoute,
        private _componentFactoryResolver: ComponentFactoryResolver) {

        // get the shortcode of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectcode = params.get('shortcode');
        });

        // get ontology iri from route
        if (this._route.snapshot.params.id) {
            this.ontologyIri = decodeURIComponent(this._route.snapshot.params.id);
        }

        // set the page title
        if (this.ontologyIri) {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Ontology Editor');
        } else {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Ontologies');
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
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode));

        // get the project data from cache
        this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
            (result: Project) => {
                this.project = result;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin
                    ? this.sysAdmin
                    : this.session.user.projectAdmin.some(e => e === this.project.id);

                // get from cache: list of project members and groups
                if (this.projectAdmin) {
                    // this.refresh();
                }

                // get the ontologies for this project
                this._ontologyService.getProjectOntologies(encodeURI(result.id)).subscribe(
                    (ontologies: ApiServiceResult) => {

                        if (ontologies.body['@graph'] && ontologies.body['@graph'].length > 0) {

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
                            this.getOntology(this.ontologyIri);

                        }
                    },
                    (error: ApiServiceError) => {
                        console.error(error);
                    }
                );

                if (this.ontologyIri !== undefined) {
                    this.getOntology(this.ontologyIri);
                }




            },
            (error: ApiServiceError) => {
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
                console.log(this.ontology);
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


}
