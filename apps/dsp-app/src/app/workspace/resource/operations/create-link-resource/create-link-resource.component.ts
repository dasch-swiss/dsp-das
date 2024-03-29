import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  Constants,
  CreateFileValue,
  CreateResource,
  CreateTextValueAsString,
  CreateValue,
  KnoraApiConnection,
  ReadResource,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { DialogEvent } from '../../../../main/dialog/dialog.component';
import { SelectPropertiesComponent } from '../../resource-instance-form/select-properties/select-properties.component';

@Component({
  selector: 'app-create-link-resource',
  templateUrl: './create-link-resource.component.html',
  styleUrls: ['./create-link-resource.component.scss'],
})
export class CreateLinkResourceComponent implements OnInit {
  @Input() parentResource: ReadResource;
  @Input() propDef: string;
  @Input() resourceClassDef: string;
  @Input() currentOntoIri: string;

  @Output() closeDialog: EventEmitter<ReadResource | DialogEvent> = new EventEmitter<ReadResource | DialogEvent>();

  @ViewChild('selectProps')
  selectPropertiesComponent: SelectPropertiesComponent;

  properties: ResourcePropertyDefinition[];
  propertiesForm: UntypedFormGroup;
  resourceClass: ResourceClassDefinition;
  ontologyInfo: ResourceClassAndPropertyDefinitions;
  fileValue: CreateFileValue;

  hasFileValue: 'stillImage' | 'movingImage' | 'audio' | 'document' | 'text' | 'archive';

  propertiesObj = {};

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _projectApiService: ProjectApiService,
    private _fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.propertiesForm = this._fb.group({});

    this._dspApiConnection.v2.ontologyCache
      .getResourceClassDefinition(this.resourceClassDef)
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.ontologyInfo = onto;
        this.resourceClass = onto.classes[this.resourceClassDef];
        this.properties = onto
          .getPropertyDefinitionsByType(ResourcePropertyDefinition)
          .filter(
            prop =>
              !prop.isLinkProperty &&
              prop.isEditable &&
              prop.id !== Constants.HasStillImageFileValue &&
              prop.id !== Constants.HasDocumentFileValue &&
              prop.id !== Constants.HasAudioFileValue &&
              prop.id !== Constants.HasArchiveFileValue &&
              prop.id !== Constants.HasMovingImageFileValue &&
              prop.id !== Constants.HasTextFileValue
          );

        if (onto.properties[Constants.HasStillImageFileValue]) {
          this.hasFileValue = 'stillImage';
        } else if (onto.properties[Constants.HasDocumentFileValue]) {
          this.hasFileValue = 'document';
        } else if (onto.properties[Constants.HasAudioFileValue]) {
          this.hasFileValue = 'audio';
        } else if (onto.properties[Constants.HasArchiveFileValue]) {
          this.hasFileValue = 'archive';
        } else if (onto.properties[Constants.HasMovingImageFileValue]) {
          this.hasFileValue = 'movingImage';
        } else if (onto.properties[Constants.HasTextFileValue]) {
          this.hasFileValue = 'text';
        } else {
          this.hasFileValue = undefined;
        }
      });
  }

  onSubmit() {
    if (this.propertiesForm.valid) {
      this._projectApiService.get(this.resourceClassDef.split('/')[4], 'shortcode').subscribe(response => {
        const createResource = new CreateResource();

        const resLabelVal = <CreateTextValueAsString>this.selectPropertiesComponent.createValueComponent.getNewValue();

        createResource.label = resLabelVal.text;

        createResource.type = this.resourceClassDef;

        createResource.attachedToProject = response.project.id;

        this.selectPropertiesComponent.switchPropertiesComponent.forEach(child => {
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

        this._dspApiConnection.v2.res.createResource(createResource).subscribe((res: ReadResource) => {
          this.closeDialog.emit(res);
        });
      });
    } else {
      this.propertiesForm.markAllAsTouched();
    }
  }

  onCancel() {
    // emit DialogCanceled event
    this.closeDialog.emit(DialogEvent.DialogCanceled);
  }

  setFileValue(file: CreateFileValue) {
    this.fileValue = file;
  }
}
