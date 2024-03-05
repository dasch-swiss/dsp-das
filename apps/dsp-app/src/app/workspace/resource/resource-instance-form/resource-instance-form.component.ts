import { ChangeDetectorRef, Component, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { CommonInputComponent } from '@dsp-app/src/app/project/common-input/common-input.component';
import { ComponentHostDirective } from '@dsp-app/src/app/workspace/resource/resource-instance-form/component-host.directive';
import { BooleanValue2Component } from '@dsp-app/src/app/workspace/resource/resource-instance-form/select-properties/switch-properties/boolean-value-2.component';
import { IntValue3Component } from '@dsp-app/src/app/workspace/resource/resource-instance-form/select-properties/switch-properties/int-value-3.component';
import { Store } from '@ngxs/store';
import { switchMap, take } from 'rxjs/operators';
import { ResourceService } from '../services/resource.service';
import { SelectPropertiesComponent } from './select-properties/select-properties.component';

@Component({
  selector: 'app-resource-instance-form',
  templateUrl: './resource-instance-form.component.html',
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
  unsuitableProperties: ResourcePropertyDefinition[];
  loading = false;

  futurePayload: any[] = [];
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
    private _cd: ChangeDetectorRef
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
        this.unsuitableProperties = this._getUnsuitableProperties();
        this._cd.detectChanges();
        this.resourceClass = onto.classes[resourceClassIri];
        this._buildForm();
        this._cd.detectChanges();
      });
  }

  private _buildForm() {
    this.unsuitableProperties.forEach((prop, index) => {
      this.futurePayload.push(null);
      switch (prop.objectType) {
        case Constants.IntValue:
          this.dynamicForm.addControl(prop.id, this._fb.control(0, [Validators.required]));
          const instance = this.loadComponent<IntValue3Component>(index, IntValue3Component);
          instance.control = this.dynamicForm.controls[prop.id];
          break;
        case Constants.BooleanValue:
          this.dynamicForm.addControl(prop.id, this._fb.control(false));
          const instance2 = this.loadComponent<BooleanValue2Component>(index, BooleanValue2Component);
          instance2.control = this.dynamicForm.controls[prop.id];
          break;
        case Constants.UriValue:
          this.dynamicForm.addControl(prop.id, this._fb.control(null, [Validators.email]));
          const instance3 = this.loadComponent<CommonInputComponent>(index, CommonInputComponent);
          instance3.control = this.dynamicForm.controls[prop.id];
          instance3.validatorErrors = [{ errorKey: 'email', message: 'This is not a valid email.' }];
          break;
      }
    });
  }

  submitData() {
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
      propertiesObj[iri] = [this.dynamicForm.controls[iri].value];
    });

    if (this.fileValue) {
      const hasFileValue = this.getHasFileValue(this.ontologyInfo);
      propertiesObj[hasFileValue] = [this.fileValue];
    }
    return propertiesObj;
  }

  private _getUnsuitableProperties() {
    // filter out all props that cannot be edited or are link props but also the hasFileValue props
    return this.ontologyInfo
      .getPropertyDefinitionsByType(ResourcePropertyDefinition)
      .filter(prop => !prop.isLinkProperty && prop.isEditable && !this.weirdConstants.includes(prop.id));
  }

  private loadComponent<T>(index: number, component) {
    return this.componentHosts.get(index).viewContainerRef.createComponent<T>(component).instance;
  }
}
