import { ChangeDetectorRef, Component, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
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
  @Input() resourceClassIri: string;
  @Input() projectIri: string;

  @ViewChild('selectProps')
  selectPropertiesComponent: SelectPropertiesComponent;

  @ViewChildren(ComponentHostDirective) componentHosts!: QueryList<ComponentHostDirective>;

  dynamicForm = this._fb.group({});
  resourceClass: ResourceClassDefinition;
  ontologyInfo: ResourceClassAndPropertyDefinitions;
  hasFileValue: FileRepresentationType;
  fileValue: CreateFileValue;
  unsuitableProperties: IHasPropertyWithPropertyDefinition[];
  loading = false;

  mapping = new Map<string, string>();
  labelControl = this._fb.control<string>('test', [Validators.required]);
  readonly weirdConstants = [
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

  onSelectedFile(file: CreateFileValue) {
    this.fileValue = file;
  }

  private getResourceProperties(resourceClassIri: string) {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.ontologyInfo = onto;
        this.resourceClass = onto.classes[resourceClassIri];
        this._tempLinkValueService.currentOntoIri = this.ontologyIri;

        this.hasFileValue = this.getHasFileValue(onto);
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
    this.unsuitableProperties.forEach((prop, index) => {
      this.dynamicForm.addControl(prop.propertyDefinition.id, this._fb.array([]));
      this.mapping.set(prop.propertyDefinition.id, prop.propertyDefinition.objectType);
    });
  }

  submitData() {
    if (this.dynamicForm.invalid) {
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

  private getHasFileValue(onto: ResourceClassAndPropertyDefinitions) {
    for (const item of this.weirdConstants) {
      if (onto.properties[item]) {
        return item as FileRepresentationType;
      }
    }
  }

  private _getPayload() {
    const createResource = new CreateResource();
    createResource.label = this.labelControl.value;
    createResource.type = this.resourceClass.id;
    createResource.attachedToProject = this.projectIri;

    createResource.properties = this._getPropertiesObj();

    return createResource;
  }

  private _getPropertiesObj() {
    const propertiesObj = {};

    Object.keys(this.dynamicForm.controls).forEach(iri => {
      propertiesObj[iri] = this.getValue(iri);
    });

    if (this.fileValue) {
      /*
                                                                                                          const hasFileValue = this.getHasFileValue(this.ontologyInfo);
                                                                                                          propertiesObj[hasFileValue] = [this.fileValue];

                                                                                                             */
      console.log(this.fileValue);
      propertiesObj[Constants.HasStillImageFileValue] = [this._getNewValue()];
    }
    return propertiesObj;
  }

  private getValue(iri) {
    const controls = this.dynamicForm.controls[iri].controls;
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
      .filter(prop => !prop.isLinkProperty && prop.isEditable && !this.weirdConstants.includes(prop.id));
  }

  private _getNewValue(): CreateFileValue | false {
    const fileValue = new (fileValueMapping.get(this.hasFileValue).uploadClass)();
    fileValue.filename = this.fileValue.filename;

    return fileValue;
  }
}
