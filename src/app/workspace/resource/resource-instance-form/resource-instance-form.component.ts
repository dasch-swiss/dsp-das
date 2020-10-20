import { Component, EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
    ApiResponseData,
    ApiResponseError,
    ClassDefinition,
    Constants,
    CreateResource,
    KnoraApiConnection,
    OntologiesMetadata,
    PropertyDefinition,
    ReadResource,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
    StoredProject,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService, SortingService, ValueOperationEventService, ValueTypeService } from '@dasch-swiss/dsp-ui';
import { Subscription } from 'rxjs';
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
    styleUrls: ['./resource-instance-form.component.scss'],
    providers: [ValueOperationEventService]
})
export class ResourceInstanceFormComponent implements OnInit, OnDestroy {

    // output to close dialog
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    // forms
    selectResourceForm: FormGroup;
    form: FormGroup;

    session: Session;
    username: string;

    showNextStepForm: boolean;

    usersProjects: StoredProject[];
    selectedProject: string;
    ontologiesMetadata: OntologiesMetadata;
    selectedOntology: string;
    resourceClasses: ResourceClassDefinition[];
    selectedResourceClass: ResourceClassDefinition;
    resource: ReadResource;
    resourceLabel: string;
    properties: Properties;
    propertiesAsArray: Array<ResourcePropertyDefinition>; // properties as an Array structure

    valueOperationEventSubscription: Subscription;

    errorMessage: string;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _session: SessionService,
        private _fb: FormBuilder,
        private _sortingService: SortingService,
        private _valueTypeService: ValueTypeService
    ) {
        this.session = this._session.getSession();
        this.username = this.session.user.name;
    }


    ngOnInit(): void {

        // parent form is empty, it gets passed to the child components
        this.selectResourceForm = this._fb.group({});
        this.form = this._fb.group({});

        // initialize projects to be used for the project selection in the creation form
        this.initializeProjects();

        // boolean to show onl the first step of the form (= selectResourceForm)
        this.showNextStepForm = true;

        // since simple text values and rich text values share the same object type 'TextValue',
        // we need to use the ValueTypeService in order to assign it the correct object type for the ngSwitch in the template
        if (this.propertiesAsArray) {
            for (const prop of this.propertiesAsArray) {
                if (prop) {
                    if (prop.objectType === 'http://api.knora.org/ontology/knora-api/v2#TextValue') {
                        prop.objectType = this._valueTypeService.getTextValueClass(prop);
                    }
                }
            }
        }
    }

    ngOnDestroy() {
        // unsubscribe from the event bus when component is destroyed
        if (this.valueOperationEventSubscription !== undefined) {
            this.valueOperationEventSubscription.unsubscribe();
        }
    }

    nextStep() {
        this.showNextStepForm = !this.showNextStepForm;
    }

    submitData() {
        console.log('submit form');

        const createResource = new CreateResource();

        createResource.label = this.resourceLabel; console.log('label', this.resourceLabel);

        createResource.type = this.selectedResourceClass.id; console.log('type', this.selectedResourceClass.id);

        createResource.attachedToProject = this.selectedProject; console.log('project', this.selectedProject);

        // createResource.properties = ;

        /* this._dspApiConnection.v2.res.createResource(createResource).subscribe(
            (res: ReadResource) => {
                this.resource = res;
            }
        ); */

        // navigate to the resource viewer
    }

    /**
     * Get the user's project(s)
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

    /**
     * Get all the ontologies of the selected project
     * @param projectIri
     */
    selectOntologies(projectIri: string) {
        if (projectIri) {
            this.selectedProject = projectIri;

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

    /**
     * Get all the resource classes of the selected ontology
     * @param ontologyIri
     */
    selectResourceClasses(ontologyIri: string) {

        if (ontologyIri) {
            this.selectedOntology = ontologyIri;

            this._dspApiConnection.v2.ontologyCache.getOntology(ontologyIri).subscribe(
                onto => {
                        this.resourceClasses = this._makeResourceClassesArray(onto.get(ontologyIri).classes);
                },
                (error: ApiResponseError) => {
                    console.error(error);
                }
        );
        } else {
            this.errorMessage = 'No ontology defined for the selected project.';
        }
    }

    /**
     * Get the resource label typed in the form in select-resource-class
     * @param label
     */
    getResourceLabel(label: string) {
        this.resourceLabel = label;
    }

    /**
     * Get all the properties of the selected resource class
     * @param resourceClassIri
     */
    selectProperties(resourceClassIri: string) {
        if (resourceClassIri) {
            // if the client undoes the selection of a resource class, use the active ontology as a fallback
            if (resourceClassIri === null) {
                this.selectResourceClasses(this.selectedOntology);
            } else {
                this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).subscribe(
                    onto => {
                        this.selectedResourceClass = onto.classes[resourceClassIri];
                        // console.log('selectedResourceClass', this.selectedResourceClass);

                        this.properties = this._makeResourceProperties(onto.properties);
                        // console.log('properties', this.properties);

                        this.convertPropObjectAsArray();
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

    private convertPropObjectAsArray() {
        // represent the properties as an array to be accessed by the template
        const propsArray = [];

        for (const propIri in this.properties) {
            if (this.properties.hasOwnProperty(propIri)) {
                const prop = this.properties[propIri];

                // only list editable props that are not link value props
                if (prop.isEditable && !prop.isLinkValueProperty) {
                    propsArray.push(this.properties[propIri]);
                }
            }
        }

        // sort properties by label (ascending)
        this.propertiesAsArray = this._sortingService.keySortByAlphabetical(propsArray, 'label');
    }

}
