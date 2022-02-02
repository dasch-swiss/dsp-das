import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import {
    ApiResponseError,
    Constants,
    CreateFileValue,
    CreateResource,
    CreateTextValueAsString,
    CreateValue,
    KnoraApiConnection,
    ReadResource,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';
import { SelectPropertiesComponent } from '../../resource-instance-form/select-properties/select-properties.component';

@Component({
    selector: 'app-create-link-resource',
    templateUrl: './create-link-resource.component.html',
    styleUrls: ['./create-link-resource.component.scss']
})
export class CreateLinkResourceComponent implements OnInit {

    @Input() parentResource: ReadResource;
    @Input() propIri: string;
    @Input() resourceClassIri: string;
    @Input() propertiesForm: FormGroup;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('selectProps') selectPropertiesComponent: SelectPropertiesComponent;

    properties: ResourcePropertyDefinition[];
    property: ResourcePropertyDefinition;
    resourceClass: ResourceClassDefinition;
    ontologyInfo: ResourceClassAndPropertyDefinitions;
    fileValue: CreateFileValue;

    hasFileValue: 'stillImage' | 'movingImage' | 'audio' | 'document' | 'text' | 'archive';

    propertiesObj = {};

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _fb: FormBuilder,
        private _errorHandler: ErrorHandlerService,
    ) { }

    ngOnInit(): void {
        console.log('parentResource: ', this.parentResource);
        console.log('propIri: ', this.propIri);
        console.log('resourceClassIri: ', this.resourceClassIri);

        this.propertiesForm = this._fb.group({});

        this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.resourceClassIri).subscribe(
            (onto: ResourceClassAndPropertyDefinitions) => {
                console.log('onto: ', onto);
                this.ontologyInfo = onto;
                this.resourceClass = onto.classes[this.resourceClassIri];
                // this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition);
                this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition).filter(
                    prop =>
                        !prop.isLinkProperty &&
                        prop.isEditable &&
                        prop.id !== Constants.HasStillImageFileValue &&
                        prop.id !== Constants.HasDocumentFileValue &&
                        prop.id !== Constants.HasAudioFileValue &&
                        prop.id !== Constants.HasArchiveFileValue
                );

                if (onto.properties[Constants.HasStillImageFileValue]) {
                    this.hasFileValue = 'stillImage';
                } else if (onto.properties[Constants.HasDocumentFileValue]) {
                    this.hasFileValue = 'document';
                } else if (onto.properties[Constants.HasAudioFileValue]) {
                    this.hasFileValue = 'audio';
                } else if (onto.properties[Constants.HasArchiveFileValue]) {
                    this.hasFileValue = 'archive';
                } else {
                    this.hasFileValue = undefined;
                }

                console.log('properties: ', this.properties);
            }
        );
    }

    onSubmit() {
        console.log('onSubmit clicked');
        if (this.propertiesForm.valid) {
            const createResource = new CreateResource();

            const resLabelVal = <CreateTextValueAsString>this.selectPropertiesComponent.createValueComponent.getNewValue();

            createResource.label = resLabelVal.text;

            createResource.type = this.resourceClassIri;

            createResource.attachedToProject = 'http://rdfh.ch/projects/0123';

            this.selectPropertiesComponent.switchPropertiesComponent.forEach((child) => {
                const createVal = child.createValueComponent.getNewValue();
                const iri = child.property.id;
                if (createVal instanceof CreateValue) {
                    if (this.propertiesObj[iri]) {
                        // if a key already exists, add the createVal to the array
                        this.propertiesObj[iri].push(createVal);
                    } else {
                        // if no key exists, add one and add the createVal as the first value of the array
                        this.propertiesObj[iri] = [createVal];
                    }
                }

            });

            if (this.fileValue) {
                switch (this.hasFileValue) {
                    case 'stillImage':
                        this.propertiesObj[Constants.HasStillImageFileValue] = [this.fileValue];
                        break;
                    case 'document':
                        this.propertiesObj[Constants.HasDocumentFileValue] = [this.fileValue];
                        break;
                    case 'audio':
                        this.propertiesObj[Constants.HasAudioFileValue] = [this.fileValue];
                        break;
                    case 'archive':
                        this.propertiesObj[Constants.HasArchiveFileValue] = [this.fileValue];
                }
            }

            createResource.properties = this.propertiesObj;

            this._dspApiConnection.v2.res.createResource(createResource).subscribe(
                (res: ReadResource) => {
                    console.log('resource created!: ', res);

                    this.closeDialog.emit();
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        // the goal of this is to send a CreateResource request in the end
        } else {
            this.propertiesForm.markAllAsTouched();
        }
    }

    setFileValue(file: CreateFileValue) {
        this.fileValue = file;
    }
}
