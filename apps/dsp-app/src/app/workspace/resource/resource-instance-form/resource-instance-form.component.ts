import { ChangeDetectorRef, Component, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Constants,
  CreateFileValue,
  CreateResource,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadResource,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { fileValueMapping } from '@dsp-app/src/app/workspace/resource/representation/upload/file-mappings';
import { FileRepresentationType } from '@dsp-app/src/app/workspace/resource/representation/upload/file-representation.type';
import { ComponentHostDirective } from '@dsp-app/src/app/workspace/resource/resource-instance-form/component-host.directive';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/values/link-value/temp-link-value.service';
import { Store } from '@ngxs/store';
import { switchMap, take } from 'rxjs/operators';
import { ResourceService } from '../services/resource.service';
import { SelectPropertiesComponent } from './select-properties/select-properties.component';

@Component({
  selector: 'app-resource-instance-form',
  templateUrl: './resource-instance-form.component.html',
  providers: [TempLinkValueService],
})
export class ResourceInstanceFormComponent implements OnInit {
  @Input({ required: true }) resourceClassIri: string;
  @Input({ required: true }) projectIri: string;

  @ViewChild('selectProps')
  selectPropertiesComponent: SelectPropertiesComponent;

  @ViewChildren(ComponentHostDirective) componentHosts!: QueryList<ComponentHostDirective>;

  form: FormGroup<{
    label: FormControl<string>;
    dynamic: FormGroup<{ [key: string]: FormArray<FormControl<string>> }>;
    file?: FormControl<CreateFileValue>;
  }> = this._fb.group({ label: this._fb.control('', [Validators.required]), dynamic: this._fb.group({}) });
  resourceClass: ResourceClassDefinition;
  ontologyInfo: ResourceClassAndPropertyDefinitions;
  fileRepresentation: FileRepresentationType;
  fileValue: CreateFileValue;
  unsuitableProperties: IHasPropertyWithPropertyDefinition[];
  loading = false;

  mapping = new Map<string, string>();
  readonly resourceClassTypes = [
    Constants.HasStillImageFileValue,
    Constants.HasDocumentFileValue,
    Constants.HasAudioFileValue,
    Constants.HasMovingImageFileValue,
    Constants.HasArchiveFileValue,
    Constants.HasTextFileValue,
  ];

  get ontologyIri() {
    return this.resourceClassIri.split('#')[0];
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _resourceService: ResourceService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _cd: ChangeDetectorRef,
    private _tempLinkValueService: TempLinkValueService
  ) {}

  ngOnInit(): void {
    this.getResourceProperties(this.resourceClassIri);
  }

  private getResourceProperties(resourceClassIri: string) {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.ontologyInfo = onto;
        this.resourceClass = onto.classes[resourceClassIri];
        this._tempLinkValueService.currentOntoIri = this.ontologyIri;

        this.fileRepresentation = this._getFileRepresentation(onto);

        const readResource = new ReadResource();
        readResource.entityInfo = this.ontologyInfo;
        this._tempLinkValueService.parentResource = readResource;

        this.unsuitableProperties = onto.classes[resourceClassIri]
          .getResourcePropertiesList()
          .filter(v => v.guiOrder !== undefined)
          .filter(v => v.propertyDefinition['isLinkProperty'] === false);
        console.log('final', this.unsuitableProperties);
        this._buildForm();
        this._cd.detectChanges();
      });
  }

  private _buildForm() {
    if (this.fileRepresentation) {
      this.form.addControl('file', this._fb.control(null, [Validators.required]));
    }

    this.unsuitableProperties.forEach((prop, index) => {
      this.form.controls.dynamic.addControl(prop.propertyDefinition.id, this._fb.array(['']));
      this.mapping.set(prop.propertyDefinition.id, prop.propertyDefinition.objectType);
    });
  }

  submitData() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.loading = true;

    this._dspApiConnection.v2.res
      .createResource(this._getPayload())
      .pipe(
        switchMap((res: ReadResource) => {
          const uuid = this._resourceService.getResourceUuid(res.id);
          return this._router.navigate(['..', uuid], { relativeTo: this._route });
        }),
        take(1)
      )
      .subscribe(() => {
        this._store.dispatch(new LoadClassItemsCountAction(this.ontologyIri, this.resourceClass.id));
      });
  }

  private _getFileRepresentation(onto: ResourceClassAndPropertyDefinitions) {
    for (const item of this.resourceClassTypes) {
      if (onto.properties[item]) {
        return item as FileRepresentationType;
      }
    }
  }

  private _getPayload() {
    const createResource = new CreateResource();
    createResource.label = this.form.controls.label.value;
    createResource.type = this.resourceClass.id;
    createResource.attachedToProject = this.projectIri;
    createResource.properties = this._getPropertiesObj();
    return createResource;
  }

  private _getPropertiesObj() {
    const propertiesObj = {};

    Object.keys(this.form.controls.dynamic.controls).forEach(iri => {
      propertiesObj[iri] = this.getValue(iri);
    });

    if (this.form.controls.file) {
      /*
                                                                                                                                                                                                                                  const hasFileValue = this.getHasFileValue(this.ontologyInfo);
                                                                                                                                                                                                                                  propertiesObj[hasFileValue] = [this.fileValue];

                                                                                                                                                                                                                                     */
      propertiesObj[this.fileRepresentation] = [this._getFileValue()];
    }
    return propertiesObj;
  }

  private getValue(iri) {
    const controls = this.form.controls.dynamic.controls[iri].controls;
    return controls.map(control => {
      return propertiesTypeMapping.get(this.mapping.get(iri)).mapping(control.value);
    });
  }

  private getProperties() {
    // filter out all props that cannot be edited or are link props but also the hasFileValue props
    console.log(
      this.ontologyInfo,
      'julien',
      this.ontologyInfo.getPropertyDefinitionsByType(ResourcePropertyDefinition)
    );
    return this.ontologyInfo
      .getPropertyDefinitionsByType(ResourcePropertyDefinition)
      .filter(prop => !prop.isLinkProperty && prop.isEditable && !this.resourceClassTypes.includes(prop.id));
  }

  private _getFileValue() {
    const fileValue = new (fileValueMapping.get(this.fileRepresentation).uploadClass)();
    fileValue.filename = this.form.controls.file.value.filename;
    return fileValue;
  }
}
