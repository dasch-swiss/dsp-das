import { Component, Inject, Input, OnDestroy, OnInit, Optional, TemplateRef } from '@angular/core';
import {
  ApiResponseError,
  Cardinality,
  CreateValue,
  KnoraApiConnection,
  UpdateResource,
  UpdateValue,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { Subscription } from 'rxjs';
import { finalize, startWith, take, takeWhile, tap } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-value-edit',
  template: `
    <app-property-value-switcher-2
      [myProperty]="propertyValueService.propertyDefinition"
      [editMode]="true"
      (templateFound)="template = $event" />

    <div *ngIf="!loading; else loadingTpl" style="display: flex; padding: 16px 0">
      <div style="flex: 1">
        <ng-container *ngIf="template">
          <ng-container *ngTemplateOutlet="template; context: { item: group?.controls.item }"></ng-container>
        </ng-container>
      </div>
      <div style="display: flex; flex-direction: column; padding-top: 16px">
        <button (click)="goToDisplayMode()" mat-icon-button color="primary">
          <mat-icon>undo</mat-icon>
        </button>
        <button (click)="onSave()" mat-icon-button data-cy="save-button" color="primary">
          <mat-icon>save</mat-icon>
        </button>
      </div>
    </div>

    <ng-template #loadingTpl>
      <app-progress-indicator [size]="'xsmall'" />
    </ng-template>
  `,
})
export class PropertyValueEditComponent implements OnInit, OnDestroy {
  @Input({ required: true }) index!: number;
  template?: TemplateRef<any>;

  loading = false;
  private _subscription!: Subscription;

  get group() {
    return this.propertyValueService.formArray.at(this.index);
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _notification: NotificationService,
    @Optional() private _resourceFetcherService: ResourceFetcherService,
    public propertyValueService: PropertyValueService
  ) {}

  protected readonly Cardinality = Cardinality;

  ngOnInit() {
    this._watchAndSetupCommentStatus();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

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

    const resource = this.propertyValueService.editModeData.resource;
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
      });
  }

  private _getPayload(index: number) {
    const updateResource = new UpdateResource<UpdateValue>();
    const { resource, values } = this.propertyValueService.editModeData;
    updateResource.id = resource.id;
    updateResource.property = values[index].property;
    updateResource.type = resource.type;
    updateResource.value = this._getUpdatedValue(index);
    return updateResource;
  }

  private _getUpdatedValue(index: number) {
    const group = this.propertyValueService.formArray.at(index);
    const values = this.propertyValueService.editModeData.values;
    const id = values[index].id;
    const entity = propertiesTypeMapping
      .get(this.propertyValueService.propertyDefinition.objectType!)!
      .updateValue(id, group.controls.item.value, this.propertyValueService.propertyDefinition);
    if (group.controls.comment.value) {
      entity.valueHasComment = group.controls.comment.value;
    }
    return entity;
  }

  private _watchAndSetupCommentStatus() {
    this._subscription = this.group.controls.item.statusChanges
      .pipe(
        startWith(null),
        takeWhile(() => this.group !== undefined)
      )
      .subscribe(status => {
        if (status === 'INVALID' || this.group.controls.item.value === null) {
          this.group.controls.comment.disable();
        } else if (status === 'VALID') {
          this.group.controls.comment.enable();
        }
      });
  }
}
