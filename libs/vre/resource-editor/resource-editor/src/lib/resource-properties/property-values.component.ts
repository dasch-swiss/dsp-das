import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnChanges } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Cardinality, ReadResource, ReadValue } from '@dasch-swiss/dsp-js';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { ResourceFetcherService } from '../representations/resource-fetcher.service';
import { ResourceUtil } from '../representations/resource.util';
import { JsLibPotentialError } from './JsLibPotentialError';
import { PropertyValueAddComponent } from './property-value-add.component';
import { PropertyValueComponent } from './property-value.component';
import { PropertyValueService } from './property-value.service';
import { ValueOrderService } from './value-order.service';

@Component({
  selector: 'app-property-values',
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
    MatIconButton,
    MatIcon,
    PropertyValueComponent,
    PropertyValueAddComponent,
    MatTooltip,
    TranslatePipe,
  ],
  template: `
    <div
      cdkDropList
      cdkDropListLockAxis="y"
      [cdkDropListData]="editModeData.values"
      [cdkDropListDisabled]="!canReorder || isAnyValueEditing || currentlyAdding || reorderLoading"
      (cdkDropListDropped)="onDrop($event)">
      @for (group of editModeData.values; track group.id; let index = $index) {
        <div
          cdkDrag
          cdkDragLockAxis="y"
          [cdkDragDisabled]="!canReorder || isAnyValueEditing || currentlyAdding || reorderLoading"
          class="value-row">
          @if (canReorder && editModeData.values.length > 1) {
            <span cdkDragHandle class="drag-handle" aria-hidden="true">
              <mat-icon>drag_indicator</mat-icon>
            </span>
          }

          <app-property-value [index]="index" style="width: 100%" />

          <!-- Inline styles required: CDK renders *cdkDragPreview in a global overlay
               outside the component, so component-scoped styles won't reach it -->
          <div
            *cdkDragPreview
            style="padding: 12px 16px; background: white; border-radius: 4px;
                   font-size: 14px; color: rgba(0,0,0,0.87);
                   box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                               0 8px 10px 1px rgba(0,0,0,0.14),
                               0 3px 14px 2px rgba(0,0,0,0.12);">
            {{ getValueSummary(group, index) }}
          </div>

          <div *cdkDragPlaceholder class="drag-placeholder"></div>
        </div>
      }
    </div>

    @if (userCanAdd && !currentlyAdding && (editModeData.values.length === 0 || matchesCardinality)) {
      <button
        mat-icon-button
        (click)="currentlyAdding = true"
        data-cy="add-property-value-button"
        [matTooltip]="'ui.common.actions.create' | translate">
        <mat-icon class="add-icon">add_box</mat-icon>
      </button>
    }

    @if (currentlyAdding) {
      <app-property-value-add (stopAdding)="currentlyAdding = false" />
    }
  `,
  styles: [
    `
      .value-row {
        display: flex;
        align-items: flex-start;
      }

      .drag-handle {
        cursor: grab;
        opacity: 0.3;
        display: flex;
        align-items: center;
        padding: 0 4px;
        transition: opacity 200ms ease-in-out;
      }
      .value-row:hover .drag-handle {
        opacity: 0.7;
      }
      .drag-handle:active {
        cursor: grabbing;
      }

      .drag-placeholder {
        border: 3px dotted #999;
        min-height: 48px;
        border-radius: 4px;
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      .cdk-drop-list-dragging .value-row:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }

      @media (prefers-reduced-motion: reduce) {
        .cdk-drag-animating,
        .cdk-drop-list-dragging .value-row:not(.cdk-drag-placeholder) {
          transition: none !important;
        }
      }
    `,
  ],
  providers: [PropertyValueService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyValuesComponent implements OnChanges {
  @Input({ required: true }) editModeData!: { resource: ReadResource; values: ReadValue[] };
  @Input({ required: true }) myProperty!: PropertyInfoValues;

  reorderLoading = false;
  currentlyAdding = false;

  private readonly _translateService = inject(TranslateService);
  private readonly _notification = inject(NotificationService);
  private readonly _valueOrderService = inject(ValueOrderService);
  private readonly _resourceFetcherService = inject(ResourceFetcherService);
  private readonly _cd = inject(ChangeDetectorRef);

  constructor(public readonly propertyValueService: PropertyValueService) {}

  get userCanAdd() {
    return ResourceUtil.userCanEdit(this.editModeData.resource);
  }

  get canReorder(): boolean {
    return ResourceUtil.userCanEdit(this.editModeData.resource) && !this._resourceFetcherService.resourceVersion;
  }

  get isAnyValueEditing(): boolean {
    return this.propertyValueService.lastOpenedItem$.value !== null;
  }

  get matchesCardinality() {
    return [Cardinality._0_n, Cardinality._1_n].includes(this.propertyValueService.cardinality);
  }

  get propertyDefinition() {
    return JsLibPotentialError.setAs(this.myProperty.propDef);
  }

  ngOnChanges() {
    this._setupData();
  }

  getValueSummary(value: ReadValue, index: number): string {
    const str = value.strval;
    if (!str || str.trim().length === 0) {
      return `Value ${index + 1}`;
    }
    return str.length > 80 ? `${str.substring(0, 77)}...` : str;
  }

  onDrop(event: CdkDragDrop<ReadValue[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    if (this.reorderLoading) return;
    if (this.currentlyAdding) return;

    const originalOrder = [...this.editModeData.values];
    const reordered = [...originalOrder];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);

    this.editModeData.values = reordered;
    this.reorderLoading = true;
    this._cd.markForCheck();

    const orderedIris = reordered.map(v => v.id);
    this._valueOrderService
      .reorderValues(this.editModeData.resource.id, this.propertyDefinition.id, orderedIris)
      .pipe(
        finalize(() => {
          this.reorderLoading = false;
          this._cd.markForCheck();
        })
      )
      .subscribe({
        next: () => this._resourceFetcherService.reload(),
        error: e => {
          this.editModeData.values = originalOrder;
          this._cd.markForCheck();
          if (e.status === 400) {
            this._notification.openSnackBar(
              this._translateService.instant('resourceEditor.resourceProperties.actions.reorderStale'),
              'error'
            );
            this._resourceFetcherService.reload();
          } else if (e.status === 403) {
            this._notification.openSnackBar(
              this._translateService.instant('resourceEditor.resourceProperties.actions.reorderForbidden'),
              'error'
            );
          } else {
            this._notification.openSnackBar(
              this._translateService.instant('resourceEditor.resourceProperties.actions.reorderFailed'),
              'error'
            );
          }
        },
      });
  }

  private _setupData() {
    this.propertyValueService.editModeData = this.editModeData;
    this.propertyValueService.propertyDefinition = this.propertyDefinition;
    this.propertyValueService.cardinality = this.myProperty.guiDef.cardinality;
  }
}
