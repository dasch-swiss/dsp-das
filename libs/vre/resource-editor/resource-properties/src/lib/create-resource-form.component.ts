import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Cardinality,
  Constants,
  CreateResource,
  CreateValue,
  KnoraApiConnection,
  ResourceClassAndPropertyDefinitions,
  ResourceClassDefinitionWithPropertyDefinition,
  ResourcePropertyDefinition,
} from '@dasch-swiss/dsp-js';
import { ApiConstants, DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { LoadClassItemsCountAction, ResourceSelectors } from '@dasch-swiss/vre/core/state';
import { FileRepresentationType } from '@dasch-swiss/vre/resource-editor/representations';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { finalize, switchMap, take } from 'rxjs/operators';
import { CreateResourceFormInterface } from './create-resource-form.interface';
import { FormValueGroup } from './form-value-array.type';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-create-resource-form',
  template: `
    <form *ngIf="!loading; else loadingTemplate" [formGroup]="form" appInvalidControlScroll>
      <app-create-resource-form-representation
        *ngIf="form.controls.file && fileRepresentation"
        [control]="form.controls.file"
        [fileRepresentation]="fileRepresentation" />

      <app-create-resource-form-legal [formGroup]="form.controls.legal" />

      <app-create-resource-form-row
        label="Resource label *"
        tooltip="Each resource needs a (preferably unique) label. It will be a kind of resource identifier."
        data-cy="resource-label">
        <app-common-input [control]="form.controls.label" data-cy="label-input" label="Text value" />
      </app-create-resource-form-row>

      <app-create-resource-form-properties
        *ngIf="properties"
        [resourceClassIri]="resourceClassIri"
        [properties]="properties"
        [formGroup]="form.controls.properties" />

      <div style="display: flex; justify-content: end">
        <button
          mat-raised-button
          type="submit"
          color="primary"
          appLoadingButton
          data-cy="submit-button"
          [isLoading]="loading"
          (click)="submitData()">
          {{ 'form.action.submit' | translate }}
        </button>
      </div>
    </form>

    <ng-template #loadingTemplate>
      <app-progress-indicator />
    </ng-template>
  `,
})
export class CreateResourceFormComponent implements OnInit {
  @Input({ required: true }) resourceClassIri!: string;
  @Input({ required: true }) projectIri!: string;
  @Output() createdResourceIri = new EventEmitter<string>();

  form: FormGroup<CreateResourceFormInterface> = this._fb.group({
    label: this._fb.control('', { nonNullable: true, validators: [Validators.required] }),
    legal: this._fb.group({
      copyrightHolder: this._fb.control(''),
      license: this._fb.control(''),
      authorship: this._fb.control(''),
    }),
    properties: this._fb.group({}),
  });

  resourceClass!: ResourceClassDefinitionWithPropertyDefinition;
  fileRepresentation: FileRepresentationType | undefined;

  properties!: PropertyInfoValues[];
  loading = true;

  mapping = new Map<string, string>();
  readonly resourceClassTypes = [
    Constants.HasStillImageFileValue,
    Constants.HasDocumentFileValue,
    Constants.HasAudioFileValue,
    Constants.HasMovingImageFileValue,
    Constants.HasArchiveFileValue,
    Constants.HasTextFileValue,
  ];

  readonly cardinality = Cardinality;

  protected readonly Constants = Constants;

  get ontologyIri() {
    return this.resourceClassIri.split('#')[0];
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _store: Store,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._getResourceProperties();
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
      .subscribe(res => {
        this._store.dispatch(new LoadClassItemsCountAction(this.ontologyIri, this.resourceClass.id));
        this.createdResourceIri.emit(res.id);
      });
  }

  private _getResourceProperties() {
    this._dspApiConnection.v2.ontologyCache
      .reloadCachedItem(this.ontologyIri)
      .pipe(
        switchMap(() => this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.resourceClassIri)),
        finalize(() => {
          this.loading = false;
          this._cd.detectChanges();
        })
      )
      .subscribe((onto: ResourceClassAndPropertyDefinitions) => {
        this.fileRepresentation = this._getFileRepresentation(onto);
        console.log('julien file representation', this);
        this.resourceClass = onto.classes[this.resourceClassIri];
        this.properties = this.resourceClass
          .getResourcePropertiesList()
          .filter(v => v.propertyIndex.indexOf(ApiConstants.apiKnoraOntologyUrl))
          .map(v => {
            return { guiDef: v, propDef: v.propertyDefinition, values: [] };
          });

        this._buildForm();
        this._cd.detectChanges();
      });
  }

  private _buildForm() {
    if (this.fileRepresentation) {
      this.form.addControl('file', this._fb.control(null, [Validators.required]));
    }

    this.properties
      .filter(prop => propertiesTypeMapping.has(prop.propDef.objectType!))
      .forEach(prop => {
        const control = propertiesTypeMapping.get(prop.propDef.objectType!)!.control() as AbstractControl;
        if (prop.guiDef.cardinality === Cardinality._1 || prop.guiDef.cardinality === Cardinality._1_n) {
          control.addValidators(Validators.required);
        }

        this.form.controls.properties.addControl(
          prop.propDef.id,
          this._fb.array([
            this._fb.group({
              item: control,
              comment: '',
            }) as unknown as FormValueGroup,
          ])
        );
        this.mapping.set(prop.propDef.id, prop.propDef.objectType!);
      });
  }

  private _getFileRepresentation(onto: ResourceClassAndPropertyDefinitions) {
    for (const item of this.resourceClassTypes) {
      if (onto.properties[item]) {
        return item as FileRepresentationType;
      }
    }
    return undefined;
  }

  private _getPayload() {
    const createResource = new CreateResource();
    createResource.label = this.form.controls.label.value;
    createResource.type = this.resourceClass.id;
    createResource.properties = this._getPropertiesObj();
    const resource = this._store.selectSnapshot(ResourceSelectors.resource);
    createResource.attachedToProject = this.projectIri ? this.projectIri : resource!.res.attachedToProject;

    return createResource;
  }

  private _getPropertiesObj() {
    const propertiesObj: { [index: string]: CreateValue[] } = {};

    Object.keys(this.form.controls.properties.controls)
      .filter(iri => {
        const hasPropertyControlValue = this.form.controls.properties.controls[iri].controls.some(
          control => control.value.item !== null && control.value.item !== ''
        );

        const optionalItems = this.getOptionalValueItems(
          iri,
          this.form.controls.properties.controls[iri].controls,
          this.properties
        );
        return hasPropertyControlValue === true && optionalItems.length === 0 ? hasPropertyControlValue : false;
      })
      .forEach(iri => {
        propertiesObj[iri] = this._getValue(iri);
      });

    if (this.fileRepresentation && this.form.controls.file!.value) {
      propertiesObj[this.fileRepresentation] = [this.form.controls.file!.value];
    }
    return propertiesObj;
  }

  private getOptionalValueItems = (iri: string, controls: FormValueGroup[], properties: PropertyInfoValues[]) =>
    controls.filter(group => {
      let hasOptionalBoolean = false;
      if (group.value) {
        const foundProperty = properties.find(property => property.guiDef.propertyIndex === iri);
        hasOptionalBoolean = !!(
          foundProperty &&
          (foundProperty.propDef as ResourcePropertyDefinition).objectType === Constants.BooleanValue &&
          !this.isRequired(foundProperty.guiDef.cardinality) &&
          group.value.item === null
        );
      }
      return hasOptionalBoolean;
    });

  isRequired(cardinality: Cardinality): boolean {
    return [Cardinality._1, Cardinality._1_n].includes(cardinality);
  }

  private _getValue(iri: string) {
    const foundProperty = this.properties.find(property => property.guiDef.propertyIndex === iri);
    if (!foundProperty) throw new Error(`Property ${iri} not found`);
    const propertyDefinition = foundProperty.propDef as ResourcePropertyDefinition;

    const controls = this.form.controls.properties.controls[iri].controls;
    return controls
      .filter(group => group.value.item !== null)
      .map(group => {
        const entity = propertiesTypeMapping
          .get(this.mapping.get(iri)!)!
          .createValue(group.controls.item.value, propertyDefinition);
        if (group.controls.comment.value) {
          entity.valueHasComment = group.controls.comment.value;
        }
        return entity;
      });
  }
}
