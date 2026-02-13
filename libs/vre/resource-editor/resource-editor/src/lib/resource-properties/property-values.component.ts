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
  imports: [MatIconButton, MatIcon, PropertyValueComponent, PropertyValueAddComponent, MatTooltip, TranslatePipe],
  template: `
    @for (group of editModeData.values; track group.id; let index = $index) {
      <div class="value-row">
        <app-property-value [index]="index" style="width: 100%" />
        @if (canReorder && editModeData.values.length > 1) {
          <div class="reorder-buttons">
            <button
              mat-icon-button
              [disabled]="index === 0 || isAnyValueEditing || reorderLoading"
              (click)="moveUp(index)"
              [matTooltip]="'resourceEditor.resourceProperties.actions.moveUp' | translate">
              <mat-icon>arrow_upward</mat-icon>
            </button>
            <button
              mat-icon-button
              [disabled]="index === editModeData.values.length - 1 || isAnyValueEditing || reorderLoading"
              (click)="moveDown(index)"
              [matTooltip]="'resourceEditor.resourceProperties.actions.moveDown' | translate">
              <mat-icon>arrow_downward</mat-icon>
            </button>
          </div>
        }
      </div>
    }

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
      .reorder-buttons {
        display: flex;
        flex-direction: column;
        opacity: 0.5;
      }
      .reorder-buttons:hover {
        opacity: 1;
      }
      .reorder-buttons button {
        width: 28px;
        height: 28px;
        line-height: 28px;
      }
      .reorder-buttons mat-icon {
        font-size: 18px;
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

  moveUp(index: number): void {
    if (index === 0) return;
    this._swapAndReorder(index, index - 1);
  }

  moveDown(index: number): void {
    if (index >= this.editModeData.values.length - 1) return;
    this._swapAndReorder(index, index + 1);
  }

  private _swapAndReorder(fromIndex: number, toIndex: number): void {
    if (this.reorderLoading) return;
    this.reorderLoading = true;
    this._cd.markForCheck();

    const values = this.editModeData.values;
    const orderedIris = values.map(v => v.id);
    [orderedIris[fromIndex], orderedIris[toIndex]] = [orderedIris[toIndex], orderedIris[fromIndex]];

    this._valueOrderService
      .reorderValues(this.editModeData.resource.id, this.propertyDefinition.id, orderedIris)
      .pipe(
        finalize(() => {
          this.reorderLoading = false;
          this._cd.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this._resourceFetcherService.reload();
        },
        error: e => {
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
