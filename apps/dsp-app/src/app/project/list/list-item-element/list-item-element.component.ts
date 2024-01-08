import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListNode } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-list-item-element',
  template: ` <button
      *ngIf="isAdmin || node.children.length !== 0"
      type="button"
      color="primary"
      mat-icon-button
      (click)="showChildren = !showChildren">
      <mat-icon class="mat-icon-rtl-mirror"> {{ showChildren ? 'expand_more' : 'chevron_right' }} </mat-icon>
    </button>

    <div style="flex: 1">
      <!-- existing node: show label in form; value is e.g. {{node.labels[0].value}} -->
      <app-list-item-form
        [iri]="node.id"
        [language]="language"
        (refreshParent)="updateView.emit($event)"
        [projectIri]="projectIri"
        [projectUuid]="projectUuid"
        [projectStatus]="projectStatus"
        [labels]="node.labels"
        [position]="node.position"
        [isAdmin]="isAdmin"
        [lastPosition]="last"
        [parentIri]="parentIri">
      </app-list-item-form>

      <!-- recursion: list with child nodes -->
      <app-list-item
        *ngIf="showChildren && node.children.length > 0"
        [language]="language"
        [childNode]="true"
        [list]="node.children"
        [parentIri]="node.id"
        [isAdmin]="isAdmin"
        [projectIri]="projectIri"
        [projectUuid]="projectUuid"
        [projectStatus]="projectStatus">
      </app-list-item>

      <!-- in the case of no children: show form to append new item -->
      <div *ngIf="showChildren && node.children.length === 0 && projectStatus && isAdmin">
        <!-- first child should have an empty list? yes -->
        <app-list-item-form
          [parentIri]="node.id"
          [projectIri]="projectIri"
          [projectUuid]="projectUuid"
          [language]="language"
          [isAdmin]="isAdmin"
          [newNode]="true"
          (refreshParent)="updateView.emit($event)">
        </app-list-item-form>
      </div>

      <!-- form to append new item to parent node -->
      <app-list-item-form
        *ngIf="last && projectStatus && isAdmin"
        [parentIri]="parentIri"
        [projectIri]="projectIri"
        [projectUuid]="projectUuid"
        [language]="language"
        [isAdmin]="isAdmin"
        [newNode]="true"
        (refreshParent)="updateView.emit($event)">
      </app-list-item-form>
    </div>`,
})
export class ListItemElementComponent {
  @Input() list: ListNode[];

  @Input() parentIri?: string;

  @Input() projectUuid: string;

  @Input() projectStatus: boolean;

  @Input() projectIri: string;

  @Input() childNode: boolean;

  @Input() language?: string;

  @Input() node: ListNode;

  @Input() last: boolean;

  @Output() refreshChildren = new EventEmitter<ListNode[]>();
  @Output() updateView = new EventEmitter<unknown>();

  // permissions of logged-in user
  @Input() isAdmin = false;
  showChildren = false;
}
