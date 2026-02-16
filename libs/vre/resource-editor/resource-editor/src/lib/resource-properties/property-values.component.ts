import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { DraggableValueListComponent } from './draggable-value-list.component';
import { JsLibPotentialError } from './JsLibPotentialError';
import { FootnoteService } from './footnotes/footnote.service';
import { PropertyValueAddComponent } from './property-value-add.component';
import { PropertyValueComponent } from './property-value.component';
import { PropertyValueService } from './property-value.service';
import { ValueOrderService } from './value-order.service';

@Component({
  selector: 'app-property-values',
  imports: [
    DraggableValueListComponent,
    MatIconButton,
    MatIcon,
    PropertyValueComponent,
    PropertyValueAddComponent,
    MatTooltip,
    TranslatePipe,
  ],
  template: `
    <app-draggable-value-list
      [values]="editModeData.values"
      [disabled]="dragDropDisabled"
      [showHandle]="canReorder && editModeData.values.length > 1"
      (dropped)="onDrop($event)">
      <ng-template let-value let-index="index">
        <app-property-value [index]="index" style="width: 100%" />
      </ng-template>
    </app-draggable-value-list>

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
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _footnoteService = inject(FootnoteService, { optional: true });

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

  get dragDropDisabled(): boolean {
    return !this.canReorder || this.isAnyValueEditing || this.currentlyAdding || this.reorderLoading;
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

  onDrop(event: CdkDragDrop<ReadValue[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    if (this.reorderLoading) return;
    if (this.currentlyAdding) return;

    const originalOrder = [...this.editModeData.values];
    const reordered = [...originalOrder];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);

    this._footnoteService?.reset();
    this.editModeData.values = reordered;
    this.reorderLoading = true;
    this._cd.markForCheck();

    const orderedIris = reordered.map(v => v.id);
    this._valueOrderService
      .reorderValues(this.editModeData.resource.id, this.propertyDefinition.id, orderedIris)
      .pipe(
        takeUntilDestroyed(this._destroyRef),
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
          const key = e.status === 400 ? 'reorderStale' : e.status === 403 ? 'reorderForbidden' : 'reorderFailed';
          this._notification.openSnackBar(
            this._translateService.instant(`resourceEditor.resourceProperties.actions.${key}`),
            'error'
          );
          if (e.status === 400) {
            this._resourceFetcherService.reload();
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
