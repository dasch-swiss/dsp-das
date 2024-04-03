import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';

// TODO copied from action-bubble.component.ts -> change when we do a css refactor
@Component({
  selector: 'app-nu-list-action-bubble',
  template: `
    <div class="action-bubble">
      <div class="button-container d-flex">
        <ng-container *ngIf="!editMode; else editTemplate">
          <button mat-button class="edit" matTooltip="edit" (click)="$event.stopPropagation(); editAction.emit()">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-button class="edit" matTooltip="info" (click)="$event.stopPropagation(); editAction.emit()">
            <mat-icon>info</mat-icon>
          </button>
          <button
            mat-button
            class="delete"
            matTooltip="delete"
            *ngIf="showDelete"
            (click)="$event.stopPropagation(); deleteAction.emit()">
            <mat-icon>delete</mat-icon>
          </button>
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
    // https://www.kdechant.com/blog/angular-animations-fade-in-and-fade-out
    trigger('simpleFadeAnimation', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [style({ opacity: 0 }), animate(150)]),
      transition(':leave', animate(150, style({ opacity: 0 }))),
    ]),
  ],
  styleUrls: ['./nu-list-action-bubble.component.scss'],
})
export class NuListActionBubbleComponent {
  @Input() editMode!: boolean;
  @Input() showDelete!: boolean;
  @Output() editAction = new EventEmitter();
  @Output() deleteAction = new EventEmitter();
}
