import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApiResponseError,
    Constants,
    CreateFileValue,
    CreateResource,
    CreateTextValueAsString,
    CreateValue,
    KnoraApiConnection,
    ReadOntology,
    ReadResource,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/services/error-handler.service';
import { DefaultClass, DefaultResourceClasses } from 'src/app/project/ontology/default-data/default-resource-classes';
import { ResourceService } from '../services/resource.service';
import { SelectPropertiesComponent } from './select-properties/select-properties.component';

@Component({
    selector: 'app-resource-instance-form',
    templateUrl: './resource-instance-form.component.html',
    styleUrls: ['./resource-instance-form.component.scss']
})
export class ResourceInstanceFormComponent implements OnInit, OnChanges {

    // ontology's resource class iri
    @Input() resourceClassIri: string;

    // corresponding project iri
    @Input() projectIri: string;

    @ViewChild('selectProps') selectPropertiesComponent: SelectPropertiesComponent;

    // form
    propertiesParentForm: UntypedFormGroup;

    // form validation status
    formValid = false;

    ontologyIri: string;
    resourceClass: ResourceClassDefinition;
    resource: ReadResource;
    resourceLabel: string;
    properties: ResourcePropertyDefinition[];
    ontologyInfo: ResourceClassAndPropertyDefinitions;

    // get default resource class definitions to translate the subClassOf iri into human readable words
    // list of default resource classes
    defaultClasses: DefaultClass[] = DefaultResourceClasses.data;

    // selected resource class has a file value property: display the corresponding upload form
    hasFileValue: 'stillImage' | 'movingImage' | 'audio' | 'document' | 'text' | 'archive';

    fileValue: CreateFileValue;

    // prepare content
    preparing = false;
    // loading in case of submit
    loading = false;
    // in case of any error
    error = false;
    errorMessage: any;

    propertiesObj = {};

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _fb: UntypedFormBuilder,
        private _resourceService: ResourceService,
        private _route: ActivatedRoute,
        private _router: Router,
    ) { }

    ngOnInit(): void {
        // get ontology iri from res class iri
        const splitIri = this.resourceClassIri.split('#');
        this.ontologyIri = splitIri[0];
        this.getResourceProperties(this.resourceClassIri);
        this.propertiesParentForm = this._fb.group({});

    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.resourceClassIri) {
            this.ngOnInit();
        }
    }

    /**
     * get all the properties of the resource class
     * @param resourceClassIri
     */
    getResourceProperties(resourceClassIri: string) {
        // reset errorMessage, it will be reassigned in the else clause if needed
        this.errorMessage = undefined;

        this.preparing = true;
        this.loading = true;
        this._dspApiConnection.v2.ontologyCache.reloadCachedItem(this.ontologyIri).subscribe(
            (res: ReadOntology) => {
                this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri).subscribe(
                    (onto: ResourceClassAndPropertyDefinitions) => {
                        this.ontologyInfo = onto;

                        this.resourceClass = onto.classes[resourceClassIri];

                        // set label from resource class
                        const defaultClassLabel = this.defaultClasses.find(i => i.iri === this.resourceClass.subClassOf[0]);
                        this.resourceLabel = this.resourceClass.label + (defaultClassLabel ? ' (' + defaultClassLabel.label + ')' : '');

                        // filter out all props that cannot be edited or are link props but also the hasFileValue props
                        this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition).filter(
                            prop =>
                                !prop.isLinkProperty &&
                                prop.isEditable &&
                                prop.id !== Constants.HasStillImageFileValue &&
                                prop.id !== Constants.HasDocumentFileValue &&
                                prop.id !== Constants.HasAudioFileValue &&
                                prop.id !== Constants.HasMovingImageFileValue &&
                                prop.id !== Constants.HasArchiveFileValue &&
                                prop.id !== Constants.HasTextFileValue
                                // --> TODO for UPLOAD: expand with other representation file values
                        );

                        if (onto.properties[Constants.HasStillImageFileValue]) {
                            this.hasFileValue = 'stillImage';
                        } else if (onto.properties[Constants.HasDocumentFileValue]) {
                            this.hasFileValue = 'document';
                        } else if (onto.properties[Constants.HasAudioFileValue]) {
                            this.hasFileValue = 'audio';
                        } else if (onto.properties[Constants.HasMovingImageFileValue]) {
                            this.hasFileValue = 'movingImage';
                        } else if (onto.properties[Constants.HasArchiveFileValue]) {
                            this.hasFileValue = 'archive';
                        } else if (onto.properties[Constants.HasTextFileValue]) {
                            this.hasFileValue = 'text';
                        } else {
                            this.hasFileValue = undefined;
                        }

                        // notifies the user that the selected resource does not have any properties defined yet.
                        if (!this.selectPropertiesComponent && this.properties.length === 0 && !this.hasFileValue) {
                            this.errorMessage = 'No properties defined for the selected resource.';
                        }
                        this.preparing = false;
                        this.loading = false;

                    },
                    (error: ApiResponseError) => {
                        this.preparing = false;
                        this.loading = false;
                        this._errorHandler.showMessage(error);
                    }
                );
            });
    }

    setFileValue(file: CreateFileValue) {
        this.fileValue = file;
    }

    submitData() {

        this.loading = true;

        if (this.propertiesParentForm.valid) {

            const createResource = new CreateResource();

            const resLabelVal = <CreateTextValueAsString>this.selectPropertiesComponent.createValueComponent.getNewValue();

            createResource.label = resLabelVal.text;

            createResource.type = this.resourceClass.id;

            createResource.attachedToProject = this.projectIri;

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
                    case 'movingImage':
                        this.propertiesObj[Constants.HasMovingImageFileValue] = [this.fileValue];
                        break;
                    case 'archive':
                        this.propertiesObj[Constants.HasArchiveFileValue] = [this.fileValue];
                        break;
                    case 'text':
                        this.propertiesObj[Constants.HasTextFileValue] = [this.fileValue];
                }
            }

            createResource.properties = this.propertiesObj;

            this._dspApiConnection.v2.res.createResource(createResource).subscribe(
                (res: ReadResource) => {
                    this.resource = res;

                    const uuid = this._resourceService.getResourceUuid(this.resource.id);
                    const params = this._route.snapshot.url;
                    // go to ontology/[ontoname]/[classname]/[classuuid] relative to parent route beta/project/[projectcode]/
                    this._router.navigate([params[0].path, params[1].path, params[2].path, uuid],
                        { relativeTo: this._route.parent }).then(() => {
                        // refresh whole page; todo: would be better to use an event emitter to the parent to update the list of resource classes
                        // window.location.reload();
                    });

                },
                (error: ApiResponseError) => {
                    this.error = true;
                    this.loading = false;
                    this._errorHandler.showMessage(error);
                }
            );

        } else {
            this.propertiesParentForm.markAllAsTouched();
        }
    }

}
