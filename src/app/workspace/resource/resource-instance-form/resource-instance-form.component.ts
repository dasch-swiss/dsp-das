import { Component, EventEmitter, Inject, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponseData, ApiResponseError, ClassDefinition, Constants, KnoraApiConnection, OntologiesMetadata, ResourceClassDefinition, StoredProject, UserResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService } from '@dasch-swiss/dsp-ui';
import { CacheService } from 'src/app/main/cache/cache.service';

// https://dev.to/krumpet/generic-type-guard-in-typescript-258l
type Constructor<T> = { new(...args: any[]): T };

const typeGuard = <T>(o: any, className: Constructor<T>): o is T => {
    return o instanceof className;
};

@Component({
    selector: 'app-resource-instance-form',
    templateUrl: './resource-instance-form.component.html',
    styleUrls: ['./resource-instance-form.component.scss']
})
export class ResourceInstanceFormComponent implements OnInit {

    // output to close dialog
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    // forms
    selectResourceForm: FormGroup;
    form: FormGroup;

    session: Session;
    username: string;

    usersProjects: StoredProject[] = []; // TODO: enlever = []
    ontologiesMetadata: OntologiesMetadata;
    selectedOntology: string;
    activeResourceClass: ResourceClassDefinition;
    resourceClasses: ResourceClassDefinition[];

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _session: SessionService,
        private _fb: FormBuilder
    ) {
        this.session = this._session.getSession();
        this.username = this.session.user.name;
    }


    ngOnInit(): void {

        // parent form is empty, it gets passed to the child components
        this.selectResourceForm = this._fb.group({});

        // initialize projects to be used for the project selection in the creation form
        this.initializeProjects();

    }

    submitData() {
        console.log('submit form');
    }

    /**
     * Get the user's project
     */
    initializeProjects(): void {
        this.usersProjects = [];

        if (this.username) {
            this._cache.get(this.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.username)).subscribe(
                (response: ApiResponseData<UserResponse>) => {

                    for (const project of response.body.user.projects) {
                        this.usersProjects.push(project);
                        console.log('this.usersProjects', this.usersProjects);
                    }
                },
                (error: ApiResponseError) => {
                    console.error(error);
                }
            );
        }
    }

    selectOntology(projectIri: string) {

        this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).subscribe(
            (response: OntologiesMetadata) => {
                // filter out system ontologies
                response.ontologies = response.ontologies.filter(onto => onto.attachedToProject !== Constants.SystemProjectIRI);

                this.ontologiesMetadata = response; console.log('projectOntologies', this.ontologiesMetadata);
            },
            (error: ApiResponseError) => {
                console.error(error);
            }
        );
    }

    selectResourceClasses(ontologyIri: string) {

        // reset active resource class definition
        this.activeResourceClass = undefined;

        // reset specified properties
        // this.activeProperties = [];

        this.selectedOntology = ontologyIri;

        this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).subscribe(
            onto => {

                this.resourceClasses = this._makeResourceClassesArray(onto.get(ontologyIri).classes);

                // this.properties = this._makeResourceProperties(onto.get(ontologyIri).properties);
            },
            err => {
                console.error(err);
            }
        );
    }

    /**
     * Given a map of class definitions,
     * returns an array of resource class definitions.
     *
     * @param classDefs a map of class definitions
     */
    private _makeResourceClassesArray(classDefs: { [index: string]: ClassDefinition }): ResourceClassDefinition[] {

        const classIris = Object.keys(classDefs);

        // get resource class defs
        return classIris.filter(resClassIri => {
            return typeGuard(classDefs[resClassIri], ResourceClassDefinition);
        }).map(
            (resClassIri: string) => {
                return classDefs[resClassIri] as ResourceClassDefinition;
            }
        );

    }

}
