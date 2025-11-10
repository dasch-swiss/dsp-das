import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CanDoResponse } from '@dasch-swiss/dsp-js';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-erase-button',
  template: `
    @if (showButton$ | async) {
      @if (resourceCanBeDeleted$ | async; as resourceCanBeDeleted) {
        <button
          data-cy="resource-more-menu-erase-button"
          mat-menu-item
          [matTooltip]="
            resourceCanBeDeleted.canDo
              ? ('resourceEditor.moreMenu.eraseResourceTooltip' | translate)
              : resourceCanBeDeleted.cannotDoReason || ('resourceEditor.moreMenu.checkingPermissionErase' | translate)
          "
          matTooltipPosition="above"
          [disabled]="!resourceCanBeDeleted.canDo"
          (click)="erase.emit()">
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 32px; height: 24px;">
              <mat-icon>delete_forever</mat-icon>
            </span>
            {{ 'resourceEditor.moreMenu.eraseResource' | translate }}
          </span>
        </button>
      } @else {
        <app-loading-menu-item
          dataCy="resource-more-menu-erase-button"
          tooltipKey="resourceEditor.moreMenu.checkingPermissionErase"
          labelKey="resourceEditor.moreMenu.eraseResource" />
      }
    }
  `,
  standalone: false,
})
export class EraseButtonComponent {
  @Input({ required: true }) resourceCanBeDeleted$!: Observable<CanDoResponse>;
  @Input({ required: true }) showButton$!: Observable<boolean>;
  @Output() erase = new EventEmitter<void>();
}
