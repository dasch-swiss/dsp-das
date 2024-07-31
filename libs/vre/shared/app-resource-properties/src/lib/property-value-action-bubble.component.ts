import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourceUtil } from '@dasch-swiss/vre/shared/app-common';
import { ResourceFetcherService } from '@dasch-swiss/vre/shared/app-representations';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PropertyValueService } from './property-value.service';

// TODO copied from action-bubble.component.ts -> change when we do a css refactor
@Component({
  selector: 'app-property-value-action-bubble',
  template: `
    <div class="action-bubble">
      <div class="button-container d-flex">
        <ng-container *ngIf="!editMode; else editTemplate">
          <button
            *ngIf="userHasPermissionToModify"
            mat-button
            class="edit"
            matTooltip="edit"
            (click)="$event.stopPropagation(); editAction.emit()"
            data-cy="edit-button">
            <mat-icon>edit</mat-icon>
          </button>
          <ng-container *ngIf="date">
            <button
              mat-button
              class="edit"
              *ngIf="infoTooltip$ | async as infoTooltip"
              [matTooltip]="infoTooltip"
              (click)="$event.stopPropagation()">
              <mat-icon>info</mat-icon>
            </button>
          </ng-container>
          <span [matTooltip]="showDelete ? 'delete' : 'This value cannot be deleted because it is required'">
            <button
              *ngIf="userHasPermissionToModify"
              mat-button
              class="delete"
              data-cy="delete-button"
              [disabled]="!showDelete"
              (click)="$event.stopPropagation(); deleteAction.emit()">
              <mat-icon>delete</mat-icon>
            </button>
          </span>
        </ng-container>
      </div>
    </div>

    <ng-template #editTemplate>
      <button mat-button class="edit" matTooltip="undo" (click)="$event.stopPropagation(); editAction.emit()">
        <mat-icon>undo</mat-icon>
      </button>
    </ng-template>
  `,
  animations: [
    trigger('simpleFadeAnimation', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [style({ opacity: 0 }), animate(150)]),
      transition(':leave', animate(150, style({ opacity: 0 }))),
    ]),
  ],
  styleUrls: ['./property-value-action-bubble.component.scss'],
})
export class PropertyValueActionBubbleComponent implements OnInit {
  @Input() editMode!: boolean;
  @Input() showDelete!: boolean;
  @Input() date!: string;
  @Output() editAction = new EventEmitter();
  @Output() deleteAction = new EventEmitter();

  infoTooltip$!: Observable<string>;

  get userHasPermissionToModify() {
    return !this._propertyValueService._editModeData || this._propertyValueService._editModeData.values.length === 0
      ? false
      : ResourceUtil.userCanEdit(this._propertyValueService._editModeData.values[0]);
  }

  constructor(
    private _resourceFetcherService: ResourceFetcherService,
    private _propertyValueService: PropertyValueService
  ) {}

  ngOnInit() {
    this.infoTooltip$ = this._getInfoToolTip();
  }

  private _getInfoToolTip() {
    return this._resourceFetcherService.resource$.pipe(
      map(resource => {
        const creator = resource!.res!.attachedToUser;
        return `Creation date: ${this.date}. Value creator: ${creator}`;
      })
    );
  }
}
