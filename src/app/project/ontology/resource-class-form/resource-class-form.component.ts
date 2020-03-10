import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ListsResponse, ReadOntology, StringLiteral } from '@knora/api';
import { ApiServiceError, ApiServiceResult, KnoraApiConnectionToken, NewProperty, NewResourceClass, OntologyService } from '@knora/core';
import { from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CacheService } from 'src/app/main/cache/cache.service';
import { ResourceClassFormService } from './resource-class-form.service';

// nested form components; solution from:
// https://medium.com/@joshblf/dynamic-nested-reactive-forms-in-angular-654c1d4a769a

@Component({
    selector: 'app-resource-class-form',
    templateUrl: './resource-class-form.component.html',
    styleUrls: ['./resource-class-form.component.scss']
})
export class ResourceClassFormComponent implements OnInit, OnDestroy, AfterViewChecked {

    /**
     * current project iri
     */
    @Input() projectIri: string;

    /**
     * selected resource class is a subclass from knora base (baseClassIri)
     * e.g. knora-api:StillImageRepresentation
     */
    @Input() subClassOf: string;

    /**
     * name of resource class e.g. Still image
     * this will be used to update title of resource class form
     */
    @Input() name: string;
    // store name as resourceClassTitle on init; in this case it can't be overwritten in the next / prev navigation
    resourceClassTitle: string;

    /**
     * emit event, when closing dialog
     */
    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    /**
     * update title and subtitle in dialog header (by switching from step 1 (resource class) to step 2 (properties))
     */
    @Output() updateParent: EventEmitter<{ title: string, subtitle: string }> = new EventEmitter<{ title: string, subtitle: string }>();

    // current ontology; will get it from cache by key 'currentOntology'
    ontology: ReadOntology;

    // success of sending data
    success = false;

    // message after successful post
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the resource class and all properties'
    };

    // progress
    loading: boolean;

    // in case of an error, show message
    errorMessage: any;

    // two step form: which should be active?
    showResourceClassForm: boolean = true;

    // form group, form array (for properties) errors and validation messages
    resourceClassForm: FormGroup;

    // label and comment are stringLiterals
    resourceClassLabels: StringLiteral[] = [];
    resourceClassComments: StringLiteral[] = [];

    // sub / second form of resource class: properties form
    resourceClassFormSub: Subscription;

    // container for properties
    properties: FormArray;

    // reresource class name should be unique
    existingResourceClassNames: [RegExp];

    existingPropertyNames: [RegExp];

    // nameRegex: RegExp = /^(?![0-9]).(?![\u00C0-\u017F]).[a-zA-Z0-9]+\S*$/;

    // nameMinLength = 3;
    // nameMaxLength = 16;

    // form errors on the following fields:
    formErrors = {
        'label': ''
    };

    // in case of form error: show message
    validationMessages = {
        // 'name': {
        //     'required': 'Name is required.',
        //     'minlength': 'Name must be at least ' + this.nameMinLength + ' characters long.',
        //     'maxlength': 'Name cannot be more than ' + this.nameMaxLength + ' characters long.',
        //     'pattern': 'Name shouldn\'t start with a number; Spaces and special characters are not allowed.',
        //     'existingName': 'This name exists already.'
        // },
        'label': {
            'required': 'Label is required.'
        },
    };

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _ontologyService: OntologyService,
        private _resourceClassFormService: ResourceClassFormService,
        private _cache: CacheService,
        private _cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {

        // init existing names
        this.existingResourceClassNames = [
            new RegExp('anEmptyRegularExpressionWasntPossible')
        ];
        this.existingPropertyNames = [
            new RegExp('anEmptyRegularExpressionWasntPossible')
        ];

        // set file representation or default reresource class as title
        this.resourceClassTitle = this.name;

        this._cache.get('currentOntology').subscribe(
            (response: ReadOntology) => {
                this.ontology = response;

                // get all ontology resource classs:
                // can be used to select resource class as gui attribute in link property,
                // but also to avoid same name which should be unique
                const classKeys: string[] = Object.keys(response.classes);
                for (const c of classKeys) {
                    this.existingResourceClassNames.push(
                        new RegExp('(?:^|W)' + c.split('#')[1] + '(?:$|W)')
                    )
                }
            },
            (error: any) => {
                console.error(error);
            }
        );

        // get all lists; will be used to set guit attribut in list property
        this.knoraApiConnection.admin.listsEndpoint.getListsInProject(this.projectIri).subscribe(
            (response: ApiResponseData<ListsResponse>) => {
                this._cache.set('currentOntologyLists', response.body.lists);
            },
            (error: ApiResponseError) => {
                console.error(error);
            }
        );

        this.buildForm();

        // set randomized string name for the class id (name)
        // const uniqueNameId: string = this._resourceClassFormService.setUniqueName(this.ontology.id);
        // this.resourceClassForm.controls['name'].setValue(uniqueNameId);

        // this.resourceClassForm.statusChanges.subscribe((data) => {
        //     // do something on form changes
        // });

        this._cdr.detectChanges();

    }

    ngOnDestroy() {
        this.resourceClassFormSub.unsubscribe();
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

        // reset properties
        this._resourceClassFormService.resetProperties();

        this.resourceClassFormSub = this._resourceClassFormService.resourceClassForm$
            .subscribe(resourceClass => {
                this.resourceClassForm = resourceClass;
                this.properties = this.resourceClassForm.get('properties') as FormArray;
            });

        this.resourceClassForm.valueChanges.subscribe(data => this.onValueChanged(data));
    }

    onValueChanged(data?: any) {

        if (!this.resourceClassForm) {
            return;
        }

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = this.resourceClassForm.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });

    }

    /**
     * add property line
     */
    addProperty() {
        this._resourceClassFormService.addProperty();
    }
    /**
     * delete property line
     */
    removeProperty(index: number) {
        this._resourceClassFormService.removeProperty(index);
    }
    /**
     * reset properties
     */
    resetProperties() {
        this._resourceClassFormService.resetProperties();
        this.addProperty();
    }
    /**
     * drag and drop property line
     */
    drop(event: CdkDragDrop<string[]>) {

        // set sort order for child component
        moveItemInArray(this.properties.controls, event.previousIndex, event.currentIndex);

        // set sort order in form value
        moveItemInArray(this.resourceClassForm.value.properties, event.previousIndex, event.currentIndex);
    }
    /**
     * set stringLiterals for label or comment from kui-string-literal-input
     * @param  {StringLiteral[]} data
     * @param  {string} type
     */
    handleData(data: StringLiteral[], type: string) {

        switch (type) {
            case 'labels':
                this.resourceClassLabels = data;
                break;

            case 'comments':
                this.resourceClassComments = data;
                break;
        }
    }

    //
    // form navigation:

    /**
     * Go to next step: from resource-class form forward to properties form
     */
    nextStep(ev: Event) {
        ev.preventDefault();
        // this.loading = true;
        // go to next step: properties form
        this.showResourceClassForm = false;

        // use response to go further with properties
        this.updateParent.emit({ title: this.resourceClassLabels[0].value, subtitle: 'Define the metadata for resource class' });

        // load one first property line
        if (!this.resourceClassForm.value.properties.length) {
            this.addProperty();
        }
        // this.loading = false;
    }
    /**
     * Go to previous step: from properties form back to resource-class form
     */
    prevStep(ev: Event) {
        ev.preventDefault();
        // this.loading = true;
        this.updateParent.emit({ title: this.resourceClassTitle, subtitle: 'Customize resource class' });
        this.showResourceClassForm = true;
        // this.loading = false;
    }

    //
    // submit

    /**
     * Submit data to create resource class with properties and cardinalities
     */
    submitData() {
        this.loading = true;

        let lastModificationDate: string = this.ontology.lastModificationDate;


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

        // first step: get data from first form: resource class

        if (!this.resourceClassComments.length) {
            this.resourceClassComments = this.resourceClassLabels;
        }

        // set resource class name / id
        const uniqueClassName: string = this._resourceClassFormService.setUniqueName(this.ontology.id);

        // set resource class data
        const reresourceClassData: NewResourceClass = {
            name: uniqueClassName,
            labels: this.resourceClassLabels,
            comments: this.resourceClassComments,
            subClassOf: this.subClassOf
        };

        // set properties data
        // TODO: build props
        // const resourcePropertyData: NewProperty[] = [];
        // let i = 0;
        // for (const prop of this.resourceClassForm.value.properties) {
        //     // console.warn('prop from form:', prop);
        //     const newProp: NewProperty = {
        //         label: prop.label,
        //         comment: prop.label,
        //         subPropOf: prop.type.subPropOf,
        //         guiElement: prop.type.gui_ele,
        //         guiOrder: i,
        //         cardinality: this.setCardinality(prop.multiple, prop.requirerd),
        //         guiAttributes: []
        //     };
        //     resourcePropertyData.push(newProp);



        //     i++;
        // }



        // submit resource class data to knora and create resource class incl. cardinality
        // console.log('submit resource class data:', reresourceClassData);
        // let i: number = 0;
        this._ontologyService.addResourceClass(this.ontology.id, lastModificationDate, reresourceClassData).subscribe(
            (classResponse: ApiServiceResult) => {
                // console.log('classResponse', classResponse);

                // set properties data
                lastModificationDate = classResponse['knora-api:lastModificationDate']['@value'];
                // console.log('lastModDate (class response)', lastModificationDate);

                let c: number = 0;
                const props = from(this.resourceClassForm.value.properties);

                props.subscribe(
                    (prop: any) => {
                        // console.log(prop);

                    }
                );


                // for (let i = 0; i < props.length; i++) {
                //     const uniquePropName: string = (props[i].name ? props[i].name : this._resourceClassFormService.setUniqueName(this.ontology.id));
                //     const propData: NewProperty = {
                //         name: uniquePropName,
                //         label: props[i].label,
                //         comment: props[i].label,
                //         subPropOf: props[i].type.subPropOf,
                //         guiElement: props[i].type.gui_ele,
                //         guiOrder: i,
                //         cardinality: this.setCardinality(props[i].multiple, props[i].requirerd),
                //         guiAttributes: []
                //     };

                //     if (i === c) {
                //         console.log(i + ') Post property', props[i].label);
                //         this._ontologyService.addProperty(this.ontology.id, lastModificationDate, classResponse['@graph'][0]['@id'], propData).subscribe(
                //             (propertyResponse: ApiServiceResult) => {
                //                 lastModificationDate = propertyResponse['knora-api:lastModificationDate']['@value'];

                //                 // update class with cardinality and gui-order
                //                 console.log(i + ') Set prop restriction', props[i].label);
                //                 this._ontologyService.setPropertyRestriction(
                //                     this.ontology.id,
                //                     lastModificationDate,
                //                     classResponse['@graph'][0]['@id'],
                //                     propertyResponse['@graph'][0]['@id'],
                //                     propData.cardinality,
                //                     propData.guiOrder
                //                 ).subscribe(
                //                     (cardinalityResponse: any) => {
                //                         console.log(i + ') cardinalityResponse', cardinalityResponse);
                //                         lastModificationDate = cardinalityResponse['knora-api:lastModificationDate']['@value'];
                //                     },
                //                     (error: ApiServiceError) => {
                //                         console.error('failed on setPropertyRestriction', error);
                //                     }
                //                 );
                //             },
                //             (error: ApiServiceError) => {
                //                 console.error('failed on addProperty', error);
                //             }
                //         );
                //     } else {
                //         c++;
                //     }

                // }




                // propsArray.subscribe(
                //     (prop: any) => {
                //         const propData: NewProperty = {
                //             label: prop.label,
                //             comment: prop.label,
                //             subPropOf: prop.type.subPropOf,
                //             guiElement: prop.type.gui_ele,
                //             guiOrder: i,
                //             cardinality: this.setCardinality(prop.multiple, prop.requirerd),
                //             guiAttributes: []
                //         };
                //         if (i !== i - 1) {

                //         }
                //         console.log(i + ') Post property', prop.label);
                //         this._ontologyService.addProperty(this.ontology.id, lastModificationDate, classResponse['@graph'][0]['@id'], propData).pipe(
                //             map((propertyResponse: ApiServiceResult) => {
                //                 console.log('map', propertyResponse);
                //                 lastModificationDate = propertyResponse['knora-api:lastModificationDate']['@value'];
                //                 console.log(i + ') lastModDate (map prop response)', lastModificationDate);
                //                 i++;
                //             }),
                //             mergeMap(update => lastModificationDate = update['knora-api:lastModificationDate']['@value'])
                //         ).subscribe(
                //             (echo) => {
                //                 console.log('subscribe', echo);
                //                 lastModificationDate = echo['knora-api:lastModificationDate']['@value'];
                //                 console.log(i + ') lastModDate (subscribe prop response)', lastModificationDate);
                //             }
                //         );
                //     }
                // );

                // let i: number = 0;
                // while (i < this.resourceClassForm.value.properties.length) {
                //     const prop = this.resourceClassForm.value.properties[i];

                //     const propData: NewProperty = {
                //         label: prop.label,
                //         comment: prop.label,
                //         subPropOf: prop.type.subPropOf,
                //         guiElement: prop.type.gui_ele,
                //         guiOrder: i,
                //         cardinality: this.setCardinality(prop.multiple, prop.requirerd),
                //         guiAttributes: []
                //     };

                //     console.log(i + ') Post property', prop.label);
                //     this.recursivePost(this.ontology.id, lastModificationDate, classResponse['@graph'][0]['@id'], propData).subscribe(
                //         (response: any) => {
                //             console.log('recursive post response', response);
                //             i++;
                //         }
                //     );

                // this._ontologyService.addProperty(this.ontology.id, lastModificationDate, classResponse['@graph'][0]['@id'], propData).pipe(
                //     map((propertyResponse: ApiServiceResult) => {
                //         // console.log(i + ') propertyResponse', propertyResponse);
                //         lastModificationDate = propertyResponse['knora-api:lastModificationDate']['@value'];
                //         console.log(i + ') lastModDate (prop response)', lastModificationDate);
                //     },
                //         (error: ApiServiceError) => {
                //             console.error('failed on addProperty', error);
                //         })
                // ).subscribe(
                //     (echo) => {
                //         console.log('subscribe', echo);
                //         i++;
                //     }
                // );
                // }


                // .subscribe(
                //     (propertyResponse: ApiServiceResult) => {

                //         // update class with cardinality and gui-order
                //         // console.log(i + ') Set prop restriction', prop.label);
                //         // this._ontologyService.setPropertyRestriction(
                //         //     this.ontology.id,
                //         //     lastModificationDate,
                //         //     classResponse['@graph'][0]['@id'],
                //         //     propertyResponse['@graph'][0]['@id'],
                //         //     propData.cardinality,
                //         //     propData.guiOrder).subscribe(
                //         //         (cardinalityResponse: any) => {
                //         //             console.log(i + ') cardinalityResponse', cardinalityResponse);
                //         //             lastModificationDate = cardinalityResponse['knora-api:lastModificationDate']['@value'];
                //         //             setTimeout(() => {
                //         //                 i++;
                //         //             });
                //         //         },
                //         //         (error: ApiServiceError) => {
                //         //             console.error('failed on setPropertyRestriction', error);
                //         //         }
                //         //     );

                //         setTimeout(() => {
                //             i++;
                //         }, 2000);
                //     },

                // close the dialog box
                this.loading = false;

            },
            (error: ApiServiceError) => {
                console.error('failed on addResourceClass', error);
            }
        );


        // show message to close dialog box
        // this.closeMessage();
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
        this.resourceClassForm.reset();
        this.resourceClassFormSub.unsubscribe();
        this.closeDialog.emit();
    }


    recursivePost(ontologyIri: string, lmd: string, classIri: string, data: NewProperty): Observable<any> {
        return this._ontologyService.addProperty(ontologyIri, lmd, classIri, data).pipe(
            map(response => {
                // console.log('map response from addProperty', response);
            })
        );
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

    resource class ( = "resource class" in the simple user interface)

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
