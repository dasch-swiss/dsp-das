import { ChangeDetectorRef, Component, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Constants,
  CreateBooleanValue,
  CreateColorValue,
  CreateDecimalValue,
  CreateFileValue,
  CreateGeonameValue,
  CreateIntValue,
  CreateLinkValue,
  CreateListValue,
  CreateResource,
  CreateTextValueAsString,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadResource,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { ComponentHostDirective } from '@dsp-app/src/app/workspace/resource/resource-instance-form/component-host.directive';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/values/link-value/temp-link-value.service';
import { Store } from '@ngxs/store';
import { switchMap, take, tap } from 'rxjs/operators';
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

  private getResourceProperties(resourceClassIri: string) {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.ontologyInfo = onto;
        this.resourceClass = onto.classes[resourceClassIri];
        this._tempLinkValueService.currentOntoIri = this.ontologyIri;

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
    console.log('form', this.dynamicForm);
    if (this.dynamicForm.invalid) {
      return;
    }
    console.log('payload sent', this._getPayload());
    this.loading = true;

    this._dspApiConnection.v2.res
      .createResource(this._getPayload())
      .pipe(
        tap(v => console.log(v)),
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
    for (const item in this.weirdConstants) {
      if (onto.properties[item]) {
        return item;
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
      const hasFileValue = this.getHasFileValue(this.ontologyInfo);
      propertiesObj[hasFileValue] = [this.fileValue];
    }
    return propertiesObj;
  }

  private getValue(iri) {
    const controls = this.dynamicForm.controls[iri].controls;
    switch (this.mapping.get(iri)) {
      case Constants.IntValue:
        return controls.map(control => {
          const newIntValue = new CreateIntValue();
          newIntValue.int = control.value;
          return newIntValue;
        });
      case Constants.DecimalValue:
        return controls.map(control => {
          const newDecimalValue = new CreateDecimalValue();
          newDecimalValue.decimal = control.value;
          return newDecimalValue;
        });
      case Constants.BooleanValue:
        return controls.map(control => {
          const newBooleanValue = new CreateBooleanValue();
          newBooleanValue.bool = control.value;
          return newBooleanValue;
        });
      case Constants.TextValue:
        return controls.map(control => {
          const newTextValue = new CreateTextValueAsString();
          newTextValue.text = control.value;
          return newTextValue;
        });
      // TODO case Date
      case Constants.ColorValue:
        return controls.map(control => {
          const newColorValue = new CreateColorValue();
          newColorValue.color = control.value;
          return newColorValue;
        });
      case Constants.ListValue:
        return controls.map(control => {
          const newListValue = new CreateListValue();
          newListValue.listNode = control.value;
          return newListValue;
        });
      case Constants.GeonameValue:
        return controls.map(control => {
          const newGeonameValue = new CreateGeonameValue();
          newGeonameValue.geoname = control.value;
          return newGeonameValue;
        });
      case Constants.LinkValue:
        return controls.map(control => {
          const newLinkValue = new CreateLinkValue();
          newLinkValue.linkedResourceIri = control.value;
          return newLinkValue;
        });
      default:
        return [this.dynamicForm.controls[iri].value];
    }
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
}
