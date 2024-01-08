import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChildNodeInfo, ListNode, RepositionChildNodeRequest, StringLiteral } from '@dasch-swiss/dsp-js';
import { ListApiService } from '@dasch-swiss/vre/shared/app-api';
import { ConfirmDialogComponent } from '@dsp-app/src/app/main/action/confirm-dialog/confirm-dialog.component';
import { ListItemService } from '@dsp-app/src/app/project/list/list-item/list-item.service';
import { CreateListItemDialogComponent } from '@dsp-app/src/app/project/list/list-item-form/edit-list-item/create-list-item-dialog.component';
import { ListNodeOperation } from '@dsp-app/src/app/project/list/list-item-form/list-item-form.component';
import { filter, switchMap } from 'rxjs/operators';

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
        (click)="$event.stopPropagation(); askToInsertNode(iri)"
        class="insert">
        <mat-icon>vertical_align_top</mat-icon>
      </button>
      <button mat-button class="edit" title="edit" (click)="$event.stopPropagation(); askToEditNode(iri)">
        <mat-icon>edit</mat-icon>
      </button>
      <button
        mat-button
        class="delete"
        title="delete"
        (click)="$event.stopPropagation(); askToDeleteListNode(labels[0].value, iri)">
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
  @Input() iri: string;
  @Input() projectIri: string;
  @Input() parentIri: string;
  @Input() labels: StringLiteral[];

  constructor(
    private _dialog: MatDialog,
    private _listItemService: ListItemService,
    private _listApiService: ListApiService
  ) {}

  askToDeleteListNode(name: string, iri: string) {
    this._dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: name,
          message: 'Do you want to delete this node?',
        },
      })
      .afterClosed()
      .pipe(
        filter(response => typeof response === 'boolean' && response === true),
        switchMap(() => this._listApiService.deleteListNode(iri))
      )
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }

  askToInsertNode(iri: string) {
    this._dialog
      .open(CreateListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          id: iri,
          project: this.projectIri,
          parentIri: this.parentIri,
          position: this.position,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        const listNodeOperation = new ListNodeOperation();
        listNodeOperation.listNode = response as ListNode;
        listNodeOperation.operation = 'insert';
      });
  }

  askToEditNode(iri: string) {
    this._dialog
      .open(CreateListItemDialogComponent, {
        width: '100%',
        minWidth: 500,
        data: {
          id: iri,
          project: this.projectIri,
          parentIri: this.parentIri,
          position: this.position,
        },
      })
      .afterClosed()
      .pipe(filter(response => !!response))
      .subscribe(response => {
        const listNodeOperation = new ListNodeOperation();
        listNodeOperation.listNode = response as ListNode;
        listNodeOperation.operation = 'update';

        this.labels = (response as ChildNodeInfo).labels;
      });
  }

  repositionNode(direction: 'up' | 'down') {
    this._listApiService
      .repositionChildNode(this.iri, {
        parentNodeIri: this.parentIri,
        position: direction === 'up' ? this.position - 1 : this.position + 1,
      })
      .subscribe(() => {
        this._listItemService.onUpdate$.next();
      });
  }
}
