import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    ApiResponseError,
    ClassDefinition,
    Constants,
    KnoraApiConnection,
    ListNodeInfo,
    ReadOntology,
    ResourcePropertyDefinitionWithAllLanguages,
    StringLiteral,
    UpdateOntology,
    UpdateResourcePropertyComment,
    UpdateResourcePropertyLabel
} from '@dasch-swiss/dsp-js';
import { AutocompleteItem, DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { Observable } from 'rxjs';
import { CacheService } from 'src/app/main/cache/cache.service';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { DefaultProperties, DefaultProperty, PropertyCategory, PropertyInfoObject } from '../default-data/default-properties';

@Component({
    selector: 'app-property-form',
    templateUrl: './property-form.component.html',
    styleUrls: ['./property-form.component.scss']
})
export class PropertyFormComponent implements OnInit {

    @Input() propertyInfo: PropertyInfoObject;

    /**
    * only in edit mode: iri of resource property
    */
    @Input() iri: string;

    /**
     * name of resource class e.g. Still image
     * this will be used to update title of resource class form
     */
    @Input() type: DefaultProperty;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    propDef: ResourcePropertyDefinitionWithAllLanguages;

    /**
     * form group, errors and validation messages
     */
    propertyForm: FormGroup;

    formErrors = {
        'label': ''
    };

    validationMessages = {
        'label': {
            'required': 'Label is required.',
        }
    };


    edit = false;

    ontology: ReadOntology;
    lastModificationDate: string;

    // @Output() deleteProperty: EventEmitter<number> = new EventEmitter();

    // iri = new FormControl();
    // label = new FormControl();
    // type = new FormControl();
    // multiple = new FormControl();
    // required = new FormControl();

    // selection of default property types
    propertyTypes: PropertyCategory[] = DefaultProperties.data;

    showGuiAttr = false;
    guiAttrIcon = 'tune';

    // list of project specific lists (TODO: probably we have to add default knora lists?!)
    lists: ListNodeInfo[];

    // resource classes in this ontology
    resourceClass: ClassDefinition[] = [];

    // list of existing properties
    existingProps: AutocompleteItem[] = [];

    filteredProps: Observable<AutocompleteItem[]>;

    selectTypeLabel: string; // = this.propertyTypes[0].group + ': ' + this.propertyTypes[0].elements[0].label;
    selectedGroup: string;

    existingProperty: boolean;

    loading = false;

    error = false;

    labels: StringLiteral[];
    comments: StringLiteral[];

    dspConstants = Constants;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder
    ) { }

    ngOnInit() {

        this.loading = true;

        // console.log(this.propertyInfo);

        // if property definition exists
        // we are in edit mode: prepare form to edit label and/or comment
        if (this.propertyInfo.propDef) {
            this.labels = this.propertyInfo.propDef.labels;
            this.comments = this.propertyInfo.propDef.comments;
        }


        //     // get property from current ontology

        this._cache.get('currentOntology').subscribe(
            (response: ReadOntology) => {
                this.ontology = response;
                this.lastModificationDate = response.lastModificationDate;
            },
            (error: ApiResponseError) => {
                console.error(error);
            }
        );

        this.buildForm();

        //     // init list of property types with first element
        //     this.propertyForm.patchValue({ type: this.propertyTypes[0].elements[0] });

        //     if (this.propertyForm.value.label) {

        //         const existingProp: AutocompleteItem = {
        //             iri: this.propertyInfo.propDef.id,
        //             label: this.propertyForm.value.label,
        //             name: ''
        //         };

        //         // edit mode: this prop value exists already
        //         this.loading = true;
        //         this.updateFieldsDependingOnLabel(existingProp);
        //     }
        // }

        this._cache.get('currentOntology').subscribe(
            (response: ReadOntology) => {
                this.ontology = response;

                // set various lists to select from
                // a) in case of link value:
                // set list of resource classes from response; needed for linkValue
                const classKeys: string[] = Object.keys(response.classes);
                for (const c of classKeys) {
                    this.resourceClass.push(this.ontology.classes[c]);
                }

                // b) in case of already existing label:
                // set list of properties from response; needed for autocomplete in label to reuse existing property
                const propKeys: string[] = Object.keys(response.properties);
                for (const p of propKeys) {
                    const prop = this.ontology.properties[p];
                    if (prop.objectType !== Constants.LinkValue) {
                        const existingProperty: AutocompleteItem = {
                            iri: this.ontology.properties[p].id,
                            name: this.ontology.properties[p].id.split('#')[1],
                            label: this.ontology.properties[p].label
                        };

                        this.existingProps.push(existingProperty);
                    }

                }
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );

        // c) in case of list value:
        // set list of lists; needed for listValue
        this._cache.get('currentOntologyLists').subscribe(
            (response: ListNodeInfo[]) => {
                this.lists = response;
            }
        );

        // this.filteredProps = this.propertyForm.controls['label'].valueChanges
        //     .pipe(
        //         startWith(''),
        //         map(prop => prop.length >= 0 ? this.filter(this.existingProps, prop) : [])
        //     );
    }

    buildForm() {

        this.propertyForm = this._fb.group({
            'labels': new FormControl({
                value: this.propertyInfo.propDef.labels
            }, [
                Validators.required
            ]),
            'comments': new FormControl({
                value: this.propertyInfo.propDef.comment
            }, [
                Validators.required // --> TODO: really required???
            ]),
            'type': new FormControl({
                value: this.propertyInfo.propType
            }, [
                Validators.required,
            ]),
            'guiAttr': new FormControl({
                value: this.propertyInfo.propDef.guiAttributes
            })
        });

        this.updateAttributeField(this.propertyInfo.propType);

        this.propertyForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
    }

    /**
     * this method is for the form error handling
     *
     * @param data Data which changed.
     */
    onValueChanged(data?: any) {

        if (!this.propertyForm) {
            return;
        }

        const form = this.propertyForm;

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });
    }

    handleData(data: StringLiteral[], type: string) {

        switch (type) {
            case 'labels':
                this.labels = data;
                break;

            case 'comments':
                this.comments = data;
                break;
        }
    }

    /**
     * filter a list while typing in auto complete input field
     * @param list List of options
     * @param label Value to filter by
     * @returns Filtered list of options
     */
    filter(list: AutocompleteItem[], label: string) {
        return list.filter(prop =>
            prop.label?.toLowerCase().includes(label.toLowerCase())
        );
    }

    updateAttributeField(type: DefaultProperty) {

        // reset value of guiAttr
        this.propertyForm.controls['guiAttr'].setValue(undefined);
        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource class
        switch (type.objectType) {
            case Constants.ListValue:
            case Constants.LinkValue:
                this.showGuiAttr = true;
                this.propertyForm.controls['guiAttr'].setValidators([
                    Validators.required
                ]);
                this.propertyForm.controls['guiAttr'].updateValueAndValidity();
                break;

            default:
                this.propertyForm.controls['guiAttr'].clearValidators();
                this.propertyForm.controls['guiAttr'].updateValueAndValidity();
                this.showGuiAttr = false;
        }

        // set gui attribute value depending on gui element
        switch (type.guiEle) {
            // prop type is a list
            case Constants.SalsahGui + Constants.HashDelimiter + 'List':
            case Constants.SalsahGui + Constants.HashDelimiter + 'Radio':
                // gui attribute value for lists looks as follow: hlist=<http://rdfh.ch/lists/00FF/73d0ec0302>
                // get index from guiAttr array where value starts with hlist=
                const i = this.propertyInfo.propDef.guiAttributes.findIndex(element => element.includes('hlist'));

                // find content beteween pointy brackets to get list iri
                const re = /\<([^)]+)\>/;
                const listIri = this.propertyInfo.propDef.guiAttributes[i].match(re)[1];

                this.showGuiAttr = true;
                this.propertyForm.controls['guiAttr'].setValue(listIri);
                this.propertyForm.controls['guiAttr'].disable();
                break;

            // prop type is resource pointer
            case Constants.SalsahGui + Constants.HashDelimiter + 'Searchbox':

                this.showGuiAttr = true;
                this.propertyForm.controls['guiAttr'].setValue(this.propertyInfo.propDef.objectType);
                this.propertyForm.controls['guiAttr'].disable();
                break;

            default:
                this.showGuiAttr = false;
        }

        this.loading = false;

    }

    submitData() {
        // do something with your data
        if (this.propertyInfo.propDef) {
            // edit mode: res property info (label and comment)
            // label
            const onto4Label = new UpdateOntology<UpdateResourcePropertyLabel>();
            onto4Label.id = this.ontology.id;
            onto4Label.lastModificationDate = this.lastModificationDate;

            const updateLabel = new UpdateResourcePropertyLabel();
            updateLabel.id = this.propertyInfo.propDef.id;
            updateLabel.labels = this.labels;
            onto4Label.entity = updateLabel;

            // comment
            const onto4Comment = new UpdateOntology<UpdateResourcePropertyComment>();
            onto4Comment.id = this.ontology.id;

            const updateComment = new UpdateResourcePropertyComment();
            updateComment.id = this.propertyInfo.propDef.id;
            updateComment.comments = this.comments;
            onto4Comment.entity = updateComment;

            this._dspApiConnection.v2.onto.updateResourceProperty(onto4Label).subscribe(
                (classLabelResponse: ResourcePropertyDefinitionWithAllLanguages) => {
                    this.ontology.lastModificationDate = classLabelResponse.lastModificationDate;
                    onto4Comment.lastModificationDate = this.ontology.lastModificationDate;

                    this._dspApiConnection.v2.onto.updateResourceProperty(onto4Comment).subscribe(
                        (classCommentResponse: ResourcePropertyDefinitionWithAllLanguages) => {
                            this.ontology.lastModificationDate = classCommentResponse.lastModificationDate;

                            // close the dialog box
                            this.loading = false;
                            this.closeDialog.emit();
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                        }
                    );

                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );

        } else {
            // create mode: new property incl. gui type and attribute
            // submit property
            // this.submitProps(this.resourceClassForm.value.properties, this.propertyInfo.propDef.id);
        }
    }

}
