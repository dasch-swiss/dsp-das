import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ListNode } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { MultiLanguages } from '@dasch-swiss/vre/shared/app-string-literal';
import { filter, switchMap } from 'rxjs/operators';
import { DialogService } from '../../../main/services/dialog.service';
import { ListItemService } from '../list-item/list-item.service';
import {
  CreateListItemDialogComponent,
  CreateListItemDialogProps,
} from '../list-item-form/edit-list-item/create-list-item-dialog.component';
import {
  EditListItemDialogComponent,
  EditListItemDialogProps,
} from '../list-item-form/edit-list-item/edit-list-item-dialog.component';

@Component({
  selector: 'app-action-bubble',
  template: ` <div class="action-bubble" [@simpleFadeAnimation]="'in'">
    <div class="button-container" style="display: flex">
      <button
        mat-button
        *ngIf="position > 0"
        title="move up"
        (click)="$event.stopPropagation(); repositionNode('up')"
        class="reposition up">
        <mat-icon>arrow_upward</mat-icon>
      </button>
      <button
        mat-button
        *ngIf="position < length - 1"
        title="move down"
        (click)="$event.stopPropagation(); repositionNode('down')"
        class="reposition down">
        <mat-icon>arrow_downward</mat-icon>
      </button>
      <button
        mat-button
        title="insert new child node above"
        (click)="$event.stopPropagation(); askToInsertNode()"
        class="insert">
        <mat-icon>vertical_align_top</mat-icon>
      </button>
      <button mat-button class="edit" title="edit" (click)="$event.stopPropagation(); askToEditNode()">
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-button class="delete" title="delete" (click)="$event.stopPropagation(); askToDeleteListNode()">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  </div>`,
  animations: [
    // https://www.kdechant.com/blog/angular-animations-fade-in-and-fade-out
    trigger('simpleFadeAnimation', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [style({ opacity: 0 }), animate(150)]),
      transition(':leave', animate(150, style({ opacity: 0 }))),
    ]),
  ],
  styleUrls: ['./action-bubble.component.scss'],
})
export class ActionBubbleComponent {
  @Input() position: number;
  @Input() length: number;
  @Input() node: ListNode;

  constructor(
    private _dialog: DialogService,
    private _matDialog: MatDialog,
    private _listItemService: ListItemService,
    private _listApiService: ListApiService
  ) {}

  askToDeleteListNode() {
    this._dialog
      .afterConfirmation('Do you want to delete this node?', this.node.labels[0].value)
      .pipe(switchMap(() => this._listApiService.deleteListNode(this.node.id)))
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  askToInsertNode() {
    this._matDialog
      .open<CreateListItemDialogComponent, CreateListItemDialogProps, boolean>(CreateListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          nodeIri: this.node.id,
          projectIri: this._listItemService.projectInfos.projectIri,
          parentIri: this._listItemService.projectInfos.rootNodeIri,
          position: this.position,
        },
      })
      .afterClosed()
      .pipe(filter(response => response === true))
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  askToEditNode() {
    console.log('action bubble', this);
    this._matDialog
      .open<EditListItemDialogComponent, EditListItemDialogProps, boolean>(EditListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          nodeIri: this.node.id,
          projectIri: this._listItemService.projectInfos.projectIri,
          formData: { labels: this.node.labels as MultiLanguages, descriptions: this.node.comments as MultiLanguages },
        },
      })
      .afterClosed()
      .pipe(filter(response => response === true))
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  repositionNode(direction: 'up' | 'down') {
    this._listApiService
      .repositionChildNode(this.node.id, {
        parentNodeIri: this._listItemService.projectInfos.rootNodeIri,
        position: direction === 'up' ? this.position - 1 : this.position + 1,
      })
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }
}
