import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
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
import { ComponentCommunicationEventService } from '@dasch-swiss/vre/shared/app-helper-services';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { switchMap } from 'rxjs/operators';
import { ResourceService } from '../services/resource.service';
import { SelectPropertiesComponent } from './select-properties/select-properties.component';

@Component({
  selector: 'app-resource-instance-form',
  templateUrl: './resource-instance-form.component.html',
})
export class ResourceInstanceFormComponent implements OnInit, OnChanges {
  @Input() resourceClassIri: string;
  @Input() projectIri: string;

  @ViewChild('selectProps')
  selectPropertiesComponent: SelectPropertiesComponent;

  propertiesParentForm = this._fb.group({});

  resourceClass: ResourceClassDefinition;

  ontologyInfo: ResourceClassAndPropertyDefinitions;

  fileValue: CreateFileValue;
  loading = false;

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

  get properties() {
    // filter out all props that cannot be edited or are link props but also the hasFileValue props
    return this.ontologyInfo
      .getPropertyDefinitionsByType(ResourcePropertyDefinition)
      .filter(prop => !prop.isLinkProperty && prop.isEditable && !this.weirdConstants.includes(prop.id));
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: UntypedFormBuilder,
    private _resourceService: ResourceService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _componentCommsService: ComponentCommunicationEventService,
    private _cd: ChangeDetectorRef,
    private _store: Store
  ) {}

  ngOnInit(): void {
    this.getResourceProperties(this.resourceClassIri);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.resourceClassIri) {
      this.ngOnInit();
    }
  }

  private getResourceProperties(resourceClassIri: string) {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.ontologyInfo = onto;
        this.resourceClass = onto.classes[resourceClassIri];
      });
  }

  submitData() {
    this.loading = true;

    const createResource = new CreateResource();
    const resLabelVal = <CreateTextValueAsString>this.selectPropertiesComponent.createValueComponent.getNewValue();
    createResource.label = resLabelVal.text;
    createResource.type = this.resourceClass.id;
    createResource.attachedToProject = this.projectIri;

    const propertiesObj = {};

    this.selectPropertiesComponent.switchPropertiesComponent.forEach(child => {
      const createVal = child.createValueComponent.getNewValue();
      const iri = child.property.id;
      if (createVal instanceof CreateValue) {
        if (propertiesObj[iri]) {
          // if a key already exists, add the createVal to the array
          propertiesObj[iri].push(createVal);
        } else {
          // if no key exists, add one and add the createVal as the first value of the array
          propertiesObj[iri] = [createVal];
        }
      }
    });

    if (this.fileValue) {
      const hasFileValue = this.getHasFileValue(this.ontologyInfo);
      propertiesObj[hasFileValue] = [this.fileValue];
    }

    createResource.properties = propertiesObj;

    this._dspApiConnection.v2.res.createResource(createResource).subscribe((res: ReadResource) => {
      const uuid = this._resourceService.getResourceUuid(res.id);
      const params = this._route.snapshot.url;
      // go to ontology/[ontoname]/[classname]/[classuuid] relative to parent route project/[projectcode]/
      this._router
        .navigate([params[0].path, params[1].path, params[2].path, uuid], {
          relativeTo: this._route.parent,
        })
        .then(() => {
          this._store.dispatch(new LoadClassItemsCountAction(this.ontologyIri, this.resourceClass.id));
        });
    });
  }

  private getHasFileValue(onto: ResourceClassAndPropertyDefinitions) {
    for (const item in this.weirdConstants) {
      if (onto.properties[item]) {
        return item;
      }
    }
  }
}
