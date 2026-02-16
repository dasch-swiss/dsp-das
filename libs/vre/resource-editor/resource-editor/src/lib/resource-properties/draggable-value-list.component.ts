import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ReadValue } from '@dasch-swiss/dsp-js';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-draggable-value-list',
  standalone: true,
  imports: [
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    CdkDragPlaceholder,
    NgTemplateOutlet,
    MatIcon,
    TranslatePipe,
  ],
  template: `
    <div
      cdkDropList
      cdkDropListLockAxis="y"
      [cdkDropListData]="values"
      [cdkDropListDisabled]="disabled"
      (cdkDropListDropped)="dropped.emit($event)">
      @for (value of values; track value.id; let index = $index) {
        <div cdkDrag cdkDragLockAxis="y" [cdkDragDisabled]="disabled" class="value-row">
          @if (showHandle) {
            <span
              cdkDragHandle
              class="drag-handle"
              [attr.aria-label]="'resourceEditor.resourceProperties.actions.dragToReorder' | translate">
              <mat-icon>drag_indicator</mat-icon>
            </span>
          }

          <ng-container
            [ngTemplateOutlet]="itemTemplate"
            [ngTemplateOutletContext]="{ $implicit: value, index: index }" />

          <!-- Inline styles required: CDK renders *cdkDragPreview in a global overlay
               outside the component, so component-scoped styles won't reach it -->
          <div
            *cdkDragPreview
            style="padding: 12px 16px; background: white; border-radius: 4px;
                   font-size: 14px; color: rgba(0,0,0,0.87);
                   box-shadow: 0 5px 5px -3px rgba(0,0,0,0.2),
                               0 8px 10px 1px rgba(0,0,0,0.14),
                               0 3px 14px 2px rgba(0,0,0,0.12);">
            {{ previewTextFn(value, index) }}
          </div>

          <div *cdkDragPlaceholder class="drag-placeholder"></div>
        </div>
      }
    </div>
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DraggableValueListComponent {
  @Input({ required: true }) values!: ReadValue[];
  @Input() disabled = false;
  @Input() showHandle = false;
  @Input() previewTextFn: (value: ReadValue, index: number) => string = (_, i) => `Value ${i + 1}`;

  @Output() dropped = new EventEmitter<CdkDragDrop<ReadValue[]>>();

  @ContentChild(TemplateRef) itemTemplate!: TemplateRef<{ $implicit: ReadValue; index: number }>;
}
