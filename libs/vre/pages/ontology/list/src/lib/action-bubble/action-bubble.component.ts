import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ListNode } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { MultiLanguages } from '@dasch-swiss/vre/ui/string-literal';
import { DIALOG_LARGE, DialogService } from '@dasch-swiss/vre/ui/ui';
import { filter, switchMap } from 'rxjs';
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
    <div class="button-container d-flex">
      @if (position > 0) {
        <button
          mat-button
          [matTooltip]="_translate.instant('pages.ontology.list.actionBubble.moveUp')"
          (click)="$event.stopPropagation(); repositionNode('up')"
          class="reposition up">
          <mat-icon>arrow_upward</mat-icon>
        </button>
      }
      @if (position < length - 1) {
        <button
          mat-button
          [matTooltip]="_translate.instant('pages.ontology.list.actionBubble.moveDown')"
          (click)="$event.stopPropagation(); repositionNode('down')"
          class="reposition down">
          <mat-icon>arrow_downward</mat-icon>
        </button>
      }
      <button
        mat-button
        [matTooltip]="_translate.instant('pages.ontology.list.actionBubble.insertChild')"
        (click)="$event.stopPropagation(); askToInsertNode()"
        class="insert">
        <mat-icon>vertical_align_top</mat-icon>
      </button>
      <button
        mat-button
        class="edit"
        [matTooltip]="_translate.instant('pages.ontology.list.actionBubble.edit')"
        (click)="$event.stopPropagation(); askToEditNode()">
        <mat-icon>edit</mat-icon>
      </button>
      <button
        mat-button
        class="delete"
        [matTooltip]="_translate.instant('pages.ontology.list.actionBubble.delete')"
        (click)="$event.stopPropagation(); askToDeleteListNode()">
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
  standalone: false,
})
export class ActionBubbleComponent {
  @Input({ required: true }) position!: number;
  @Input({ required: true }) length!: number;
  @Input({ required: true }) node!: ListNode;
  @Input({ required: true }) parentNodeIri!: string;

  protected readonly _translate = inject(TranslateService);

  constructor(
    private _dialog: DialogService,
    private _matDialog: MatDialog,
    private _listItemService: ListItemService,
    private _listApiService: ListApiService
  ) {}

  askToDeleteListNode() {
    this._dialog
      .afterConfirmation(
        this._translate.instant('pages.ontology.list.actionBubble.deleteNode'),
        this.node.labels[0].value
      )
      .pipe(switchMap(() => this._listApiService.deleteListNode(this.node.id)))
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  askToInsertNode() {
    this._matDialog
      .open<CreateListItemDialogComponent, CreateListItemDialogProps, boolean>(CreateListItemDialogComponent, {
        ...DIALOG_LARGE,
        data: {
          nodeIri: this.node.id,
          projectIri: this._listItemService.projectInfos.projectIri,
          parentIri: this.parentNodeIri,
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
    this._matDialog
      .open<EditListItemDialogComponent, EditListItemDialogProps, boolean>(
        EditListItemDialogComponent,
        DspDialogConfig.dialogDrawerConfig(
          {
            nodeIri: this.node.id,
            projectIri: this._listItemService.projectInfos.projectIri,
            formData: {
              labels: this.node.labels as MultiLanguages,
              comments: this.node.comments as MultiLanguages,
            },
          },
          true
        )
      )
      .afterClosed()
      .pipe(filter(response => response === true))
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  repositionNode(direction: 'up' | 'down') {
    this._listApiService
      .repositionChildNode(this.node.id, {
        parentNodeIri: this.parentNodeIri,
        position: direction === 'up' ? this.position - 1 : this.position + 1,
      })
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }
}
