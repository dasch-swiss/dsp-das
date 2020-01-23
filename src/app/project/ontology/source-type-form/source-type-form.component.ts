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

    /**
     * selected resource class is a subclass from knora base (baseClassIri)
     * e.g. knora-api:StillImageRepresentation
     */
    @Input() subClassOf: string;

    /**
     * name of resource class e.g. Still image
     * this will be used to update title of source type form
     */
    @Input() name: string;
    // store name as sourceTypeName on init; in this case it can't be overwritten in the next / prev navigation
    sourceTypeName: string;

    /**
     * emit event, when closing dialog
     */
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * update title and subtitle in dialog header (by switching from step 1 (source type) to step 2 (properties))
     */
    @Output() updateParent: EventEmitter<{ title: string, subtitle: string }> = new EventEmitter<{ title: string, subtitle: string }>();

    // current ontology; will get it from cache by key 'currentOntology'; type: Json-LD
    ontology: any;

    // reference to the component controlling the property selection
    // @ViewChildren('property') propertyComponents: QueryList<SourceTypePropertyComponent>;

    // success of sending data
    success = false;

    // message after successful post
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the source type and all properties'
    };

    // progress
    loading: boolean = true;

    // in case of an error, show message
    errorMessage: any;

    // two step form: which should be active?
    showSourceTypeForm: boolean = true;

    // form group, form array (for properties) errors and validation messages
    sourceTypeForm: FormGroup;

    // label and comment are stringLiterals
    sourceTypeLabels: StringLiteral[] = [];
    sourceTypeComments: StringLiteral[] = [];

    // sub / second form of source type: properties form
    sourceTypeFormSub: Subscription;

    // container for properties
    properties: FormArray;

    // form validation status
    formValid: boolean = false;

    // form errors on the following fields:
    // label is required
    formErrors = {
        'label': ''
    };

    // in cas of form error: show message
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
        private _sourceTypeFormService: SourceTypeFormService
    ) {
        // set file representation or default resource type as title
        this.sourceTypeName = this.name;
    }

    ngOnInit() {

        this._cache.get('currentOntology').subscribe(
            (response: ApiServiceResult) => {
                this.ontology = response.body;
            },
            (error: any) => {
                console.error(error);
            }
        );

        this.buildForm();

        this.sourceTypeForm.statusChanges.subscribe((data) => {
            this.formValid = this.sourceTypeForm.valid && this.properties.valid;
        });

        this.loading = false;

        this._cdr.detectChanges();

    }

    ngOnDestroy() {
        this.sourceTypeFormSub.unsubscribe();
    }

    ngAfterViewChecked() {
        this._cdr.detectChanges();
    }

    //
    // form handling:

    /**
     * build form
     */
    buildForm() {

        this.loading = true;
        this.formValid = false;

        this._sourceTypeFormService.resetProperties();

        this.sourceTypeFormSub = this._sourceTypeFormService.sourceTypeForm$
            .subscribe(sourceType => {
                this.sourceTypeForm = sourceType;
                // this.properties = new FormArray([]);
                this.properties = this.sourceTypeForm.get('properties') as FormArray;
            });

        // this.sourceTypeForm.controls['subClassOf'].setValue(this.subClassOf);

        this.loading = false;

    }
    /**
     * add property line
     */
    addProperty() {
        this._sourceTypeFormService.addProperty();
        this.formValid = !this.properties.valid;
    }
    /**
     * delete property line
     */
    removeProperty(index: number) {
        this._sourceTypeFormService.removeProperty(index);
    }
    /**
     * reset properties
     */
    resetProperties() {
        this._sourceTypeFormService.resetProperties();
        this.addProperty();
    }
    /**
     * drag and drop property line
     */
    drop(event: CdkDragDrop<string[]>) {

        // set sort order for child component
        moveItemInArray(this.properties.controls, event.previousIndex, event.currentIndex);

        // set sort order in form value
        moveItemInArray(this.sourceTypeForm.value.properties, event.previousIndex, event.currentIndex);
    }
    /**
     * set stringLiterals for label or comment from kui-string-literal-input
     * @param  {StringLiteral[]} data
     * @param  {string} type
     */
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

    //
    // form navigation:

    /**
     * Go to next step: from resource-class form forward to properties form
     */
    nextStep() {
        this.loading = true;
        // go to next step: properties form
        this.showSourceTypeForm = false;

        // use response to go further with properties
        this.updateParent.emit({ title: this.sourceTypeLabels[0].value, subtitle: 'Define the metadata for source type' });

        // load one first property line
        if (!this.sourceTypeForm.value.properties.length) {
            this.addProperty();
        }
        this.loading = false;
    }
    /**
     * Go to previous step: from properties form back to resource-class form
     */
    prevStep() {
        this.loading = true;
        this.updateParent.emit({ title: this.sourceTypeName, subtitle: 'Customize source type' });
        this.showSourceTypeForm = true;
        this.loading = false;
    }

    //
    // submit

    /**
     * Submit data to create resource class with properties and cardinalities
     */
    submitData() {
        this.loading = true;

        // fix variables:

        // - ontologyIri from this.ontology

        // - ontologyLastModificationDate from this.ontology

        // - classIri

        // - baseClassIri

        // for each property:
        // - propertyIri
        // - basePropertyIri --> can be knora-api:hasValue, knora-api:hasLinkTo, or any of their subproperties, with the exception of file properties
        // - cardinality
        // - subjectType    --> subclass of knora-api:Resource e.g. images:bild || images:person
        // - objectType     --> literal datatype: e.g. xsd:string || knora-api:Date

        // from salsah-gui-ontology
        // - guiElementIri
        // - guiAttribute
        // - guiOrder

        // first step: get data from first form: source type

        if (!this.sourceTypeComments.length) {
            this.sourceTypeComments = this.sourceTypeLabels;
        }

        // set resource class data
        const resourceTypeData: NewResourceClass = {
            labels: this.sourceTypeLabels,
            comments: this.sourceTypeComments,
            subClassOf: this.subClassOf
        };

        // set properties data
        // TODO: build props
        const resourcePropertyData: NewProperty[] = [];
        let i = 0;
        for (const prop of this.sourceTypeForm.value.properties) {
            console.warn('prop from form:', prop);
            const newProp: NewProperty = {
                label: prop.label,
                comment: prop.label,
                subPropOf: prop.type.subPropOf,
                guiElement: prop.type.gui_ele,
                guiOrder: i,
                cardinality: this.setCardinality(prop.multiple, prop.requirerd),
                guiAttributes: []
            };
            resourcePropertyData.push(newProp);
            i++;
        }



        // submit source type data to knora and create source type incl. cardinality
        // console.log('submit source type data:', resourceTypeData);

        this._ontologyService.addResourceClass(this.ontology['@id'], this.ontology['knora-api:lastModificationDate'], resourceTypeData).subscribe(
            (rtResponse: any) => {
                console.log(rtResponse);

                // set properties data
                // TODO: build props
                // const resourcePropertyData: NewProperty[] = [];
                i = 0;
                for (const propData of resourcePropertyData) {
                    console.warn('prop from form:', propData);

                    // TODO: update rtResponse['@id'] !!! wrong value
                    this._ontologyService.addProperty(this.ontology['@id'], this.ontology['knora-api:lastModificationDate'], rtResponse['@id'], propData).subscribe(
                        (rpResponse: any) => {
                            console.log(rpResponse);
                        },
                        (error: ApiServiceError) => {
                            console.error('failed on addProperty', error);
                        }
                    );

                    i++;
                }


            },
            (error: ApiServiceError) => {
                console.error('failed on addResourceClass', error);
            }
        );


        // close the dialog box
        this.closeMessage();
    }
    /**
     * Convert cardinality values (multiple? & required?) from form to string 1-0, 0-n, 1, 0-1
     * @param  {boolean} multiple
     * @param  {boolean} required
     * @returns string
     */
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
     * Close dialog box and reset all forms
     */
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
