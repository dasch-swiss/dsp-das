import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Cardinality,
  Constants,
  CreateFileValue,
  CreateResource,
  IHasPropertyWithPropertyDefinition,
  KnoraApiConnection,
  ReadResource,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinitionWithPropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { FormValueArray, FormValueGroup } from '@dasch-swiss/vre/shared/app-resource-properties';
import { LoadClassItemsCountAction } from '@dasch-swiss/vre/shared/app-state';
import { fileValueMapping } from '@dsp-app/src/app/workspace/resource/representation/upload/file-mappings';
import { FileRepresentationType } from '@dsp-app/src/app/workspace/resource/representation/upload/file-representation.type';
import { propertiesTypeMapping } from '@dsp-app/src/app/workspace/resource/resource-instance-form/resource-payloads-mapping';
import { TempLinkValueService } from '@dsp-app/src/app/workspace/resource/temp-link-value.service';
import { Store } from '@ngxs/store';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-resource-instance-form',
  template: `
    <form *ngIf="!loading; else loadingTemplate" [formGroup]="form" appInvalidControlScroll>
      <app-upload-2
        *ngIf="form.controls.file"
        [formControl]="form.controls.file"
        [representation]="fileRepresentation"
        style="display: block; margin-bottom: 16px;     max-width: 700px;"></app-upload-2>

      <div class="my-grid">
        <h3
          class="mat-subtitle-2 my-h3"
          matTooltip="Each resource needs a (preferably unique) label. It will be a kind of resource identifier."
          matTooltipPosition="above">
          Resource label *
        </h3>
        <app-common-input [control]="form.controls.label" data-cy="label-input"></app-common-input>
      </div>

      <div class="my-grid">
        <ng-container *ngFor="let prop of properties">
          <div style="padding-top: 16px" class="mat-subtitle-2 my-h3">{{ prop.propertyDefinition.label }}</div>
          <div>
            <app-property-value-switcher
              [propertyDefinition]="prop.propertyDefinition"
              [property]="prop"
              [formArray]="form.controls.properties.controls[prop.propertyDefinition.id]"
              [cardinality]="prop.cardinality"></app-property-value-switcher>
          </div>
        </ng-container>
      </div>

      <button
        mat-raised-button
        type="submit"
        color="primary"
        appLoadingButton
        data-cy="submit-button"
        [isLoading]="loading"
        (click)="submitData()">
        {{ 'appLabels.form.action.submit' | translate }}
      </button>
    </form>

    <ng-template #loadingTemplate>
      <dasch-swiss-app-progress-indicator></dasch-swiss-app-progress-indicator>
    </ng-template>
  `,
  styles: [
    '.my-grid {display: grid; grid-template-columns: 140px 470px; grid-gap: 10px} .my-grid .my-h3 {text-align: right}',
  ],
  providers: [TempLinkValueService],
})
export class ResourceInstanceFormComponent implements OnInit {
  @Input({ required: true }) resourceClassIri!: string;
  @Input({ required: true }) projectIri!: string;
  @Output() createdResourceIri = new EventEmitter<string>();

  form: FormGroup<{
    label: FormControl<string>;
    properties: FormGroup<{ [key: string]: FormValueArray }>;
    file?: FormControl<CreateFileValue>;
  }> = this._fb.group({ label: this._fb.control('', [Validators.required]), properties: this._fb.group({}) });

  resourceClass: ResourceClassDefinitionWithPropertyDefinition | undefined;
  fileRepresentation: FileRepresentationType;
  properties: IHasPropertyWithPropertyDefinition[];
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
    private _store: Store,
    private _cd: ChangeDetectorRef,
    private _tempLinkValueService: TempLinkValueService
  ) {}

  ngOnInit(): void {
    this._getResourceProperties(this.resourceClassIri);
  }

  submitData() {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.loading = true;

    this._dspApiConnection.v2.res
      .createResource(this._getPayload())
      .pipe(take(1))
      .subscribe((res: ReadResource) => {
        this._store.dispatch(new LoadClassItemsCountAction(this.ontologyIri, this.resourceClass.id));
        this.createdResourceIri.emit(res.id);
      });
  }

  private _getResourceProperties(resourceClassIri: string) {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(resourceClassIri)))
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this._tempLinkValueService.currentOntoIri = this.ontologyIri;

        this.fileRepresentation = this._getFileRepresentation(onto);

        const readResource = new ReadResource();
        readResource.entityInfo = onto;
        this._tempLinkValueService.parentResource = readResource;

        this.resourceClass = onto.classes[resourceClassIri];
        this.properties = this.resourceClass
          .getResourcePropertiesList()
          .filter(v => v.guiOrder !== undefined)
          .filter(v => v.propertyDefinition['isLinkProperty'] === false);
        this._buildForm();
        this._cd.detectChanges();
      });
  }

  private _buildForm() {
    if (this.fileRepresentation) {
      this.form.addControl('file', this._fb.control(null, [Validators.required]));
    }

    this.properties.forEach((prop, index) => {
      const control = propertiesTypeMapping.get(prop.propertyDefinition.objectType).control() as AbstractControl;
      if (prop.cardinality === Cardinality._1 || prop.cardinality === Cardinality._1_n) {
        control.addValidators(Validators.required);
      }

      this.form.controls.properties.addControl(
        prop.propertyDefinition.id,
        this._fb.array([
          this._fb.group({
            item: control,
            comment: '',
          }) as unknown as FormValueGroup,
        ])
      );
      this.mapping.set(prop.propertyDefinition.id, prop.propertyDefinition.objectType);
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

    Object.keys(this.form.controls.properties.controls)
      .filter(iri => this.form.controls.properties.controls[iri].controls.some(control => control.value.item !== null))
      .forEach(iri => {
        propertiesObj[iri] = this.getValue(iri);
      });

    if (this.form.controls.file) {
      propertiesObj[this.fileRepresentation] = [this._getFileValue()];
    }
    return propertiesObj;
  }

  private getValue(iri: string) {
    const controls = this.form.controls.properties.controls[iri].controls;
    return controls
      .filter(group => group.value.item !== null)
      .map(group => {
        const entity = propertiesTypeMapping.get(this.mapping.get(iri)).mapping(group.controls.item.value);
        if (group.controls.comment.value) {
          entity.valueHasComment = group.controls.comment.value;
        }
        return entity;
      });
  }

  private _getFileValue() {
    const fileValue = new (fileValueMapping.get(this.fileRepresentation).uploadClass)();
    fileValue.filename = this.form.controls.file.value.filename;
    return fileValue;
  }
}
