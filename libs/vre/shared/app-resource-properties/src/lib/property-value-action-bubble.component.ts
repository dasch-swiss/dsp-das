import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResourceSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';

// TODO copied from action-bubble.component.ts -> change when we do a css refactor
@Component({
  selector: 'app-property-value-action-bubble',
  template: `
    <div class="action-bubble">
      <div class="button-container d-flex">
        <ng-container *ngIf="!editMode; else editTemplate">
          <button
            mat-button
            class="edit"
            matTooltip="edit"
            (click)="$event.stopPropagation(); editAction.emit()"
            data-cy="edit-button">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-button class="edit" *ngIf="date" [matTooltip]="infoTooltip" (click)="$event.stopPropagation()">
            <mat-icon>info</mat-icon>
          </button>
          <span [matTooltip]="showDelete ? 'delete' : 'This value cannot be deleted because it is required'">
            <button
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

  infoTooltip!: string;

  constructor(private _store: Store) {}

  ngOnInit() {
    this.infoTooltip = this._getInfoToolTip();
  }

  private _getInfoToolTip() {
    const creator = Object.values(this._store.selectSnapshot(ResourceSelectors.attachedUsers))[0].value[0]!.username;
    return `Creation date: ${this.date}. Value creator: ${creator}`;
  }
}
