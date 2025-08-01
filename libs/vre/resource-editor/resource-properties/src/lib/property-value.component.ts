import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
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
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { distinctUntilChanged, finalize, startWith, Subscription, take, takeWhile, tap } from 'rxjs';
import { DeleteValueDialogComponent, DeleteValueDialogProps } from './delete-value-dialog.component';
import { PropertyValueService } from './property-value.service';
import { propertiesTypeMapping } from './resource-payloads-mapping';

@Component({
  selector: 'app-property-value',
  template: ` <div
    data-cy="property-value"
    class="pos-relative row"
    (mouseenter)="showBubble = true"
    (mouseleave)="showBubble = false">
    <app-property-value-action-bubble
      *ngIf="
        !propertyValueService.keepEditMode && showBubble && (propertyValueService.lastOpenedItem$ | async) !== index
      "
      [date]="propertyValueService.editModeData?.values[index]?.valueCreationDate"
      [showDelete]="index > 0 || [Cardinality._0_1, Cardinality._0_n].includes(propertyValueService.cardinality)"
      (editAction)="propertyValueService.toggleOpenedValue(index)"
      (deleteAction)="askToDelete()" />

    <div style="display: flex">
      <div class="value" [ngClass]="{ display: displayMode, highlighted: isHighlighted && displayMode }">
        <ng-container *ngTemplateOutlet="itemTpl; context: { item: group?.controls.item, displayMode: displayMode }" />

        <app-property-value-comment [displayMode]="displayMode" [control]="group?.controls.comment" />
      </div>
      <div
        *ngIf="!displayMode && !propertyValueService.keepEditMode && !loading"
        style="display: flex; flex-direction: column; padding-top: 16px">
        <button
          (click)="goToDisplayMode()"
          mat-icon-button
          color="primary"
          *ngIf="!displayMode && !propertyValueService.keepEditMode && !loading">
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

      <app-progress-indicator *ngIf="loading" [size]="'xsmall'" style="margin-top: 8px" />
    </div>
  </div>`,
  styleUrls: ['./property-value.component.scss'],
})
export class PropertyValueComponent implements OnInit {
  @Input({ required: true }) itemTpl!: TemplateRef<any>;
  @Input({ required: true }) index!: number;

  initialFormValue!: { item: any; comment: string | null };

  showBubble = false;
  displayMode = true;
  loading = false;

  subscription!: Subscription;
  isHighlighted!: boolean;

  protected readonly Cardinality = Cardinality;

  get group() {
    return this.propertyValueService.formArray.at(this.index);
  }

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

  constructor(
    public propertyValueService: PropertyValueService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _cdr: ChangeDetectorRef,
    private _notification: NotificationService,
    private _dialog: MatDialog,
    private _viewContainerRef: ViewContainerRef,
    @Optional() private _resourceFetcherService: ResourceFetcherService,
    private _route: ActivatedRoute
  ) {}

  ngOnInit() {
    this._setInitialValue();
    this._setupDisplayMode();
    this._watchAndSetupCommentStatus();

    this._highlightArkValue();
  }

  private _setInitialValue() {
    this.initialFormValue = this.group.getRawValue();
  }

  onSave() {
    if (this.propertyValueService.currentlyAdding && this.index === this.propertyValueService.formArray.length - 1) {
      this._addItem();
    } else {
      this._update();
    }
  }

  askToDelete() {
    this._dialog.open<DeleteValueDialogComponent, DeleteValueDialogProps>(DeleteValueDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        index: this.index,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  private _watchAndSetupCommentStatus() {
    this.subscription = this.group.controls.item.statusChanges
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

  private _setupDisplayMode() {
    if (this.propertyValueService.keepEditMode) {
      this.displayMode = false;
      return;
    }
    this.propertyValueService.lastOpenedItem$.pipe(distinctUntilChanged()).subscribe(value => {
      if (this.propertyValueService.currentlyAdding && !this.displayMode) {
        this.propertyValueService.formArray.removeAt(this.propertyValueService.formArray.length - 1);
        this.propertyValueService.currentlyAdding = false;
        return;
      }

      if (value === null && this.propertyValueService.formArray.length > 0) {
        this.propertyValueService.formArray.at(this.index).patchValue(this.initialFormValue);
      }

      this.displayMode = this.index !== value;
    });
  }

  _update() {
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
        this._setInitialValue();
        this._cdr.detectChanges();
      });
  }

  goToDisplayMode() {
    this.propertyValueService.toggleOpenedValue(this.index);
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

  private _highlightArkValue() {
    this.isHighlighted =
      this._route.snapshot.queryParams['highlightValue'] ===
      this.propertyValueService.editModeData?.values[this.index]?.uuid;
  }
}
