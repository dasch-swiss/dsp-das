import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Cardinality } from '@dasch-swiss/dsp-js';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EMPTY, map, Observable, of } from 'rxjs';
import { ResourceFetcherService } from '../../../representation/resource-fetcher.service';
import { ResourceUtil } from '../../../representation/resource.util';
import { PropertyValueService } from './property-value.service';

/**
 * A value's actions, at the end of the value's own line.
 *
 * In the line rather than floating over it: a bubble over the value covered the text the user was
 * about to act on (DEV-7494). Who created the value, and when, rides in the Edit button's tooltip
 * rather than a button of its own — it only gets one where there is no Edit button to carry it.
 */
@Component({
  selector: 'app-property-value-action-bubble',
  imports: [AsyncPipe, MatIconButton, MatIcon, MatTooltip, TranslatePipe],
  template: `
    <div class="value-actions" data-cy="action-bubble">
      @if (userHasPermission('edit')) {
        <button
          mat-icon-button
          type="button"
          class="value-action edit-button"
          data-cy="edit-button"
          [matTooltip]="(editTooltip$ | async) ?? ''"
          [attr.aria-label]="'resourceEditor.resourceProperties.actions.edit' | translate"
          (click)="$event.stopPropagation(); editAction.emit()">
          <mat-icon>edit</mat-icon>
        </button>
      } @else if (date) {
        @if (infoTooltip$ | async; as infoTooltip) {
          <button
            mat-icon-button
            type="button"
            class="value-action info-button"
            data-cy="info-button"
            [matTooltip]="infoTooltip"
            [attr.aria-label]="infoTooltip"
            (click)="$event.stopPropagation()">
            <mat-icon>info_outline</mat-icon>
          </button>
        }
      }

      @if (userHasPermission('delete')) {
        <span
          [matTooltip]="
            disableDeleteButton
              ? ('resourceEditor.resourceProperties.actions.cannotDeleteRequired' | translate)
              : ('resourceEditor.resourceProperties.actions.delete' | translate)
          ">
          <button
            mat-icon-button
            type="button"
            class="value-action delete"
            [disabled]="disableDeleteButton"
            data-cy="delete-button"
            [attr.aria-label]="'resourceEditor.resourceProperties.actions.delete' | translate"
            (click)="$event.stopPropagation(); deleteAction.emit()">
            <mat-icon>delete_outline</mat-icon>
          </button>
        </span>
      }
    </div>
  `,
  styleUrls: ['./property-value-actions.scss', './property-value-action-bubble.component.scss'],
})
export class PropertyValueActionBubbleComponent implements OnInit {
  @Input({ required: true }) date!: string;
  @Output() editAction = new EventEmitter();
  @Output() deleteAction = new EventEmitter();

  infoTooltip$!: Observable<string>;
  /** "Edit", followed by who created the value and when, once that is known. */
  editTooltip$!: Observable<string>;

  constructor(
    private readonly _resourceFetcherService: ResourceFetcherService,
    private readonly _propertyValueService: PropertyValueService,
    private readonly _translateService: TranslateService
  ) {}

  get disableDeleteButton(): boolean {
    const isRequired = [Cardinality._1, Cardinality._1_n].includes(this._propertyValueService.cardinality);
    const isOnlyValue = this._propertyValueService.editModeData.values.length === 1;
    return isRequired && isOnlyValue;
  }

  ngOnInit() {
    this.infoTooltip$ = this._getInfoToolTip();
    const edit = this._translateService.instant('resourceEditor.resourceProperties.actions.edit');
    this.editTooltip$ = this.date ? this.infoTooltip$.pipe(map(info => `${edit} · ${info}`)) : of(edit);
  }

  userHasPermission(permissionType: 'edit' | 'delete'): boolean {
    if (this._resourceFetcherService.resourceVersion) {
      return false;
    }

    const value = this._propertyValueService.editModeData.values[0];
    return permissionType === 'edit' ? ResourceUtil.userCanEdit(value) : ResourceUtil.userCanDelete(value);
  }

  private _getInfoToolTip() {
    return (this._resourceFetcherService.resource$ ?? EMPTY).pipe(
      map(resource => {
        const creator = resource!.res!.attachedToUser;
        return this._translateService.instant('resourceEditor.resourceProperties.actions.creationInfo', {
          date: this.date,
          creator,
        });
      })
    );
  }
}
