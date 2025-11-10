import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanDoResponse } from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-delete-button',
  template: `
    @if (resourceCanBeDeleted$ | async; as resourceCanBeDeleted) {
      <button
        data-cy="resource-more-menu-delete-button"
        mat-menu-item
        [matTooltip]="
          resourceCanBeDeleted.canDo
            ? ('resourceEditor.moreMenu.moveToTrash' | translate)
            : resourceCanBeDeleted.cannotDoReason || ('resourceEditor.moreMenu.checkingPermission' | translate)
        "
        matTooltipPosition="above"
        [disabled]="!resourceCanBeDeleted.canDo"
        (click)="delete.emit()">
        <div style="display: inline-flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 32px; height: 24px;">
            <mat-icon>delete</mat-icon>
          </span>
          {{ 'ui.common.actions.delete' | translate }}
        </div>
      </button>
    } @else {
      <app-loading-menu-item
        dataCy="resource-more-menu-delete-button"
        tooltipKey="resourceEditor.moreMenu.checkingPermission"
        labelKey="ui.common.actions.delete" />
    }
  `,
  standalone: false,
})
export class DeleteButtonComponent {
  @Input({ required: true }) resourceCanBeDeleted$!: Observable<CanDoResponse>;
  @Output() delete = new EventEmitter<void>();
}
