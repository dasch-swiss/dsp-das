import { Component, EventEmitter, Inject, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponseData, ApiResponseError, ClassDefinition, Constants, KnoraApiConnection, OntologiesMetadata, PropertyDefinition, ResourceClassDefinition, ResourcePropertyDefinition, StoredProject, UserResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService } from '@dasch-swiss/dsp-ui';
import { CacheService } from 'src/app/main/cache/cache.service';

// https://dev.to/krumpet/generic-type-guard-in-typescript-258l
type Constructor<T> = { new(...args: any[]): T };

const typeGuard = <T>(o: any, className: Constructor<T>): o is T => {
    return o instanceof className;
};

export interface Properties {
    [index: string]: ResourcePropertyDefinition;
}

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
    // form: FormGroup;

    session: Session;
    username: string;

    usersProjects: StoredProject[] = []; // TODO: enlever = []
    ontologiesMetadata: OntologiesMetadata;
    selectedOntology: string;
    activeResourceClass: ResourceClassDefinition;
    resourceClasses: ResourceClassDefinition[];
    properties: Properties;

    errorMessage: string;

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
                    }
                },
                (error: ApiResponseError) => {
                    console.error(error);
                }
            );
        }
    }

    selectOntology(projectIri: string) {

        if (projectIri) {
            this._dspApiConnection.v2.onto.getOntologiesByProjectIri(projectIri).subscribe(
                (response: OntologiesMetadata) => {
                    // filter out system ontologies
                    response.ontologies = response.ontologies.filter(onto => onto.attachedToProject !== Constants.SystemProjectIRI);

                    this.ontologiesMetadata = response;
                },
                (error: ApiResponseError) => {
                    console.error(error);
                }
            );
        } else {
            this.errorMessage = 'You are not part of any project.';
        }
    }

    selectResourceClasses(ontologyIri: string) {

        // reset active resource class definition
        this.activeResourceClass = undefined;

        // reset specified properties
        // this.activeProperties = [];

        if (ontologyIri) {
            this.selectedOntology = ontologyIri;

            this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).subscribe(
                onto => {

                    this.resourceClasses = this._makeResourceClassesArray(onto.get(ontologyIri).classes);

                    // this.properties = this._makeResourceProperties(onto.get(ontologyIri).properties);
                },
                (error: ApiResponseError) => {
                    console.error(error);
                }
        );
        } else {
            this.errorMessage = 'No ontology defined for the selected project.';
        }
    }

    selectProperties(resourceClassIri: string) {

        if (resourceClassIri) {
            // if the client undoes the selection of a resource class, use the active ontology as a fallback
            if (resourceClassIri === null) {
                this.selectResourceClasses(this.selectedOntology);
            } else {

                this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).subscribe(
                    onto => {
                        this.activeResourceClass = onto.classes[resourceClassIri]; console.log('activeResourceClass', this.activeResourceClass);

                        this.properties = this._makeResourceProperties(onto.properties);

                    }
                );
            }
        } else {
            this.errorMessage = 'No resource class defined for the selected ontology.';
        }
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

    /**
     * Given a map of property definitions,
     * returns a map of resource property definitions.
     *
     * @param propertyDefs a map of property definitions
     */
    private _makeResourceProperties(propertyDefs: { [index: string]: PropertyDefinition }): Properties {
        const resProps: Properties = {};

        const propIris = Object.keys(propertyDefs);

        propIris.filter(
            (propIri: string) => {
                return typeGuard(propertyDefs[propIri], ResourcePropertyDefinition);
            }
        ).forEach((propIri: string) => {
            resProps[propIri] = (propertyDefs[propIri] as ResourcePropertyDefinition);
        });

        return resProps;
    }

}
