import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Optional,
  TemplateRef,
} from '@angular/core';
import {
  ApiResponseError,
  Cardinality,
  Constants,
  CreateValue,
  KnoraApiConnection,
  ReadResource,
  ReadValue,
  UpdateResource,
  UpdateValue,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { finalize, take, tap } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-value-edit',
  template: ` <div>
    <ng-container
      *ngTemplateOutlet="itemTpl; context: { item: group?.controls.item, displayMode: false }"></ng-container>
    <div style="display: flex; flex-direction: column; padding-top: 16px">
      <button
        (click)="goToDisplayMode()"
        mat-icon-button
        color="primary"
        *ngIf="!propertyValueService.keepEditMode && !loading">
        <mat-icon>undo</mat-icon>
      </button>
      <button
        (click)="onSave()"
        mat-icon-button
        data-cy="save-button"
        color="primary"
        [disabled]="
          group.value.item === null ||
          group.value.item === '' ||
          (!isBoolean && valueIsUnchanged) ||
          (isBoolean && isRequired && valueIsUnchanged)
        ">
        <mat-icon>save</mat-icon>
      </button>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class PropertyValueEditComponent {
  @Input({ required: true }) index!: number;
  @Input({ required: true }) itemTpl!: TemplateRef<any>;

  loading = false; // TODO RANDOM VALUE HERE

  get isRequired() {
    return [Cardinality._1, Cardinality._1_n].includes(this.propertyValueService.cardinality);
  }

  get isBoolean() {
    return this.propertyValueService.propertyDefinition.objectType === Constants.BooleanValue;
  }

  get valueIsUnchanged(): boolean {
    return (
      (this.initialFormValue.item === this.group?.controls.item.value &&
        this.initialFormValue.comment === this.group.value.comment) ||
      (this.initialFormValue.comment === null && this.group.value.comment === '')
    );
  }

  get group() {
    return this.propertyValueService.formArray.at(this.index);
  }

  get initialFormValue(): { item: any; comment: string | null } {
    return this.group.getRawValue();
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cdr: ChangeDetectorRef,
    private _notification: NotificationService,
    @Optional() private _resourceFetcherService: ResourceFetcherService,
    public propertyValueService: PropertyValueService
  ) {}

  protected readonly Cardinality = Cardinality;

  onSave() {
    if (this.propertyValueService.currentlyAdding && this.index === this.propertyValueService.formArray.length - 1) {
      this._addItem();
    } else {
      this._update();
    }
  }

  goToDisplayMode() {
    this.propertyValueService.toggleOpenedValue(this.index);
  }

  private _addItem() {
    if (this.group.invalid) return;

    this.loading = true;

    const createVal = propertiesTypeMapping
      .get(this.propertyValueService.propertyDefinition.objectType!)!
      .createValue(this.group.controls.item.value, this.propertyValueService.propertyDefinition);

    if (this.group.controls.comment.value) {
      createVal.valueHasComment = this.group.controls.comment.value;
    }

    const resource = this.propertyValueService.editModeData?.resource as ReadResource;
    const updateRes = new UpdateResource();
    updateRes.id = resource.id;
    updateRes.type = resource.type;
    updateRes.property = this.propertyValueService.propertyDefinition.id;
    updateRes.value = createVal;

    this._dspApiConnection.v2.values
      .createValue(updateRes as UpdateResource<CreateValue>)
      .pipe(
        take(1),
        tap(() => this._resourceFetcherService.reload()),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        () => {
          this.propertyValueService.currentlyAdding = false;
          this.propertyValueService.toggleOpenedValue(this.index);
          this._cdr.detectChanges();
        },
        e => {
          if (e instanceof ApiResponseError && e.status === 400) {
            this._notification.openSnackBar('The value entered already exists.');
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw e;
        }
      );
  }

  private _update() {
    if (this.group.invalid) return;

    this.loading = true;

    this._dspApiConnection.v2.values
      .updateValue(this._getPayload(this.index))
      .pipe(
        take(1),
        tap(() => this._resourceFetcherService.reload()),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(() => {
        this.propertyValueService.toggleOpenedValue(this.index);
        this._cdr.detectChanges();
      });
  }

  private _getPayload(index: number) {
    const updateResource = new UpdateResource<UpdateValue>();
    const { resource, values } = this.propertyValueService.editModeData as {
      resource: ReadResource;
      values: ReadValue[];
    };
    updateResource.id = resource.id;
    updateResource.property = values[index].property;
    updateResource.type = resource.type;
    updateResource.value = this._getUpdatedValue(index);
    return updateResource;
  }

  private _getUpdatedValue(index: number) {
    const group = this.propertyValueService.formArray.at(index);
    const values = this.propertyValueService.editModeData?.values as ReadValue[];
    const id = values[index].id;
    const entity = propertiesTypeMapping
      .get(this.propertyValueService.propertyDefinition.objectType!)!
      .updateValue(id, group.controls.item.value, this.propertyValueService.propertyDefinition);
    if (group.controls.comment.value) {
      entity.valueHasComment = group.controls.comment.value;
    }
    return entity;
  }
}
