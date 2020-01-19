import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { KnoraApiConnection, StringLiteral } from '@knora/api';
import { ApiServiceError, ApiServiceResult, KnoraApiConnectionToken, OntologyService, NewProperty, NewResourceClass } from '@knora/core';
import { Subscription } from 'rxjs';
import { CacheService } from 'src/app/main/cache/cache.service';
import { SourceTypeFormService } from './source-type-form.service';

// nested form components; solution from:
// https://medium.com/@joshblf/dynamic-nested-reactive-forms-in-angular-654c1d4a769a

@Component({
    selector: 'app-source-type-form',
    templateUrl: './source-type-form.component.html',
    styleUrls: ['./source-type-form.component.scss']
})
export class SourceTypeFormComponent implements OnInit, OnDestroy, AfterViewChecked {

    loading: boolean = true;

    errorMessage: any;

    /**
     * default, base source type iri
     */
    @Input() iri: string;

    /**
     * selected resource class is a subclass from knora base
     */
    @Input() subClassOf: string;

    /**
     * emit event, when closing dialog
     */
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * update title and subtitle in dialog header (by switching from step 1 (source type) to step 2 (properties))
     */
    @Output() updateParent: EventEmitter<{ title: string, subtitle: string }> = new EventEmitter<{ title: string, subtitle: string }>();

    /**
     * current ontology; will get it from cache by key 'currentOntology'
     */
    ontology: any;

    /**
     * reference to the component controlling the property selection
     */
    // @ViewChildren('property') propertyComponents: QueryList<SourceTypePropertyComponent>;

    /**
     * success of sending data
     */
    success = false;

    /**
     * message after successful post
     */
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the project data.'
    };

    showSourceTypeForm: boolean = true;
    /**
     * form group, form array (for properties) errors and validation messages
     */
    sourceTypeForm: FormGroup;

    sourceTypeLabels: StringLiteral[] = [];
    sourceTypeComments: StringLiteral[] = [];

    sourceTypeFormSub: Subscription;

    propertiesForm: FormGroup;
    properties: FormArray;

    // loadingNewProp: boolean = false;

    // form validation status
    formValid: boolean = false;

    formErrors = {
        'label': ''
    };

    validationMessages = {
        'label': {
            'required': 'Label is required.'
        },
    };

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _ontologyService: OntologyService,
        private _cache: CacheService,
        private _cdr: ChangeDetectorRef,
        private _fb: FormBuilder,
        private _sourceTypeFormService: SourceTypeFormService
    ) { }

    ngOnInit() {

        this._cache.get('currentOntology').subscribe(
            (response: ApiServiceResult) => {
                this.ontology = response.body;
                // TODO: how do we get the ontology name?
            },
            (error: any) => {
                console.error(error);
            }
        );

        this.buildForm();

        this.sourceTypeForm.statusChanges.subscribe((data) => {
            console.log(data);
            console.log(this.sourceTypeLabels);

            // this.sourceTypeFormValid = this.sourceTypeForm.valid;
        });

        this.loading = false;

    }

    ngOnDestroy() {
        this.sourceTypeFormSub.unsubscribe();
    }

    ngAfterViewChecked() {
        this._cdr.detectChanges();
    }

    handleData(data: StringLiteral[], type: string) {

        switch (type) {
            case 'labels':
                this.sourceTypeLabels = data;
                break;

            case 'comments':
                this.sourceTypeComments = data;
                break;
        }
    }

    buildSourceTypeForm() {
        this.loading = true;
        this.sourceTypeLabels = [];
        this.sourceTypeComments = [];

        setTimeout(() => {
            this.loading = false;
        });
    }

    buildForm() {

        this.loading = true;
        // this.formValid = false;

        this._sourceTypeFormService.resetProperties();

        this.sourceTypeFormSub = this._sourceTypeFormService.sourceTypeForm$
            .subscribe(sourceType => {
                this.sourceTypeForm = sourceType;
                // this.properties = new FormArray([]);
                this.properties = this.sourceTypeForm.get('properties') as FormArray;
            });

        // this.sourceTypeForm.controls['subClassOf'].setValue(this.subClassOf);

        // load one first property line
        // this.addProperty();

        this.loading = false;
    }

    addProperty() {
        this._sourceTypeFormService.addProperty();
        this.formValid = !this.properties.valid;
    }

    removeProperty(index: number) {
        this._sourceTypeFormService.removeProperty(index);
    }

    handlePropertyData(data: any) {
        console.log(data);
    }

    drop(event: CdkDragDrop<string[]>) {

        // set sort order for child component
        moveItemInArray(this.properties.controls, event.previousIndex, event.currentIndex);

        // set sort order in form value
        moveItemInArray(this.sourceTypeForm.value.properties, event.previousIndex, event.currentIndex);
    }

    // submit, reset form
    submitSourceType() {
        this.loading = true;

        if (!this.sourceTypeComments.length) {
            this.sourceTypeComments = this.sourceTypeLabels;
        }

        const data: NewResourceClass = {
            labels: this.sourceTypeLabels,
            comments: this.sourceTypeComments,
            subClassOf: this.subClassOf
        };

        console.log('submit data for sourceType:', data);

        // first step: send source type data to knora and create source
        this._ontologyService.addResourceClass(this.ontology, data).subscribe(
            (response: any) => {
                console.log(response);
                // go to next step: properties form
                this.showSourceTypeForm = false;
                // use response to go further with properties
                this.updateParent.emit({ title: this.sourceTypeLabels[0].value, subtitle: 'Define the metadata for source type' });
                this.loading = false;
            },
            (error: ApiServiceError) => {
                console.error(error);
            }
        );
    }

    submitProperties() {

        this.loading = true;

        // submit properties (one by one)

        this.loading = false;

    }

    submitData() {
        this.loading = true;

        /* stopp creating new resource classes (at the moment)

        */


        // TODO: build props
        const resourceProperties: NewProperty[] = [];
        let i = 0;
        for (const prop of this.sourceTypeForm.value.properties) {
            const newProp: NewProperty = {
                label: prop.label,
                comment: prop.label,
                subPropertyOf: prop.type.subClassOf,
                guiElement: prop.type.gui_ele,
                guiOrder: i,
                cardinality: this.setCardinality(prop.multiple, prop.requirerd),
                guiAttributes: []
            };

            resourceProperties.push(newProp);

            i++;
        }

        console.log(resourceProperties);

        this._ontologyService.addProperty(this.ontology, resourceProperties).subscribe(
            (response: any) => {
                console.log(response);
            },
            (error: ApiServiceError) => {
                console.error(error);
            }
        );

        // close the dialog box
        this.closeMessage();
    }

    setCardinality(multiple: boolean, required: boolean): string {
        // result should be:
        // "1", "0-1", "1-n", "0-n"
        if (multiple && required) {
            return '1-n';
        } else if (multiple && !required) {
            return '0-n';
        } else if (!multiple && required) {
            return '1';
        } else {
            return '0-1';
        }
    }


    /**
     * Reset the form
     */
    resetSourceTypeForm(ev: Event) {
        ev.preventDefault();

        // this.sourceTypeLabels = [];
        // this.sourceTypeComments = [];

        this.buildSourceTypeForm();
    }


    resetForm(ev: Event, sourceType?: any) {

        this.buildForm();

    }

    closeMessage() {
        this.sourceTypeForm.reset();
        this.sourceTypeFormSub.unsubscribe();
        this.closeDialog.emit();
    }

    // TODO: submit data
    // we have to implement the following jsonLD objects and paths to post data

    /*

    ontology (should already be implemented in knora-ui core module)

    post /v2/ontologies

    ontology = {
        "knora-api:ontologyName": onto_name,
        "knora-api:attachedToProject": {
            "@id": project_iri
        },
        "rdfs:label": label,
        "@context": {
            "rdfs": 'http://www.w3.org/2000/01/rdf-schema#',
            "knora-api": 'http://api.knora.org/ontology/knora-api/v2#'
        }
    }

    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

    cardinality

    post: /v2/ontologies/cardinalities

    cardinality = {
        "@id": onto_iri,
        "@type": "owl:Ontology",
        "knora-api:lastModificationDate": last_onto_date,
        "@graph": [{
            "@id": class_iri,
            "@type": "owl:Class",
            "rdfs:subClassOf": {
                "@type": "owl:Restriction",
                occurrence[0]: occurrence[1],
                "owl:onProperty": {
                    "@id": prop_iri
                }
            }
        }],
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "knora-api": "http://api.knora.org/ontology/knora-api/v2#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            onto_name: onto_iri + "#"
        }
    }

    switcher = {
        "1": ("owl:cardinality", 1),
        "0-1": ("owl:maxCardinality", 1),
        "0-n": ("owl:minCardinality", 0),
        "1-n": ("owl:minCardinality", 1)
    }

    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

    property

    post: /v2/ontologies/properties

    property = {
        "@id": onto_iri,
        "@type": "owl:Ontology",
        "knora-api:lastModificationDate": last_onto_date,
        "@graph": [
            propdata
        ],
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "knora-api": "http://api.knora.org/ontology/knora-api/v2#",
            "salsah-gui": "http://api.knora.org/ontology/salsah-gui/v2#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            onto_name: onto_iri + "#"
        }
    }

    propdata = {
        "@id": onto_name + ":" + prop_name,
        "@type": "owl:ObjectProperty",
        "rdfs:label": labels,
        "rdfs:comment": comments,
        "rdfs:subPropertyOf": super_props,
        "salsah-gui:guiElement": {
            "@id": gui_element
        }
    }

    super_props:

    "hasValue",
    "hasLinkTo",
    "hasColor",
    "hasComment",
    "hasGeometry",
    "isPartOf",
    "isRegionOf",
    "isAnnotationOf",
    "seqnum"

    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+
    *+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+

    resource class ( = "source type" in the simple user interface)

    post: /v2/ontologies/classes

    res_class = {
        "@id": onto_iri,
        "@type": "owl:Ontology",
        "knora-api:lastModificationDate": last_onto_date,
        "@graph": [{
            "@id": onto_name + ":" + class_name,
            "@type": "owl:Class",
            "rdfs:label": labels,
            "rdfs:comment": comments,
            "rdfs:subClassOf": {
                "@id": super_class
            }
        }],
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "knora-api": "http://api.knora.org/ontology/knora-api/v2#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            onto_name: onto_iri + "#"
        }
    }

    super_class:

    "Resource",
    "StillImageRepresentation",
    "TextRepresentation",
    "AudioRepresentation",
    "DDDRepresentation",
    "DocumentRepresentation",
    "MovingImageRepresentation",
    "Annotation",
    "LinkObj",
    "Region"


    */

}
