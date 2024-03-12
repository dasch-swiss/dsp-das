import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListNodeV2 } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-nested-menu',
  template: `
    <button *ngIf="data.isRootNode" mat-button [matMenuTriggerFor]="menu">
      {{ data.label }}
    </button>
    <button *ngIf="!data.isRootNode" mat-menu-item [matMenuTriggerFor]="menu">
      {{ data.label }}
    </button>
    <mat-menu #menu="matMenu">
      <ng-container *ngFor="let node of data.children; let i = index">
        <button mat-menu-item style="padding: 0">
          <app-nested-menu
            [data]="node"
            *ngIf="node.children.length > 0; else menuItem"
            (selected)="selected.emit($event)"></app-nested-menu>
        </button>
        <ng-template #menuItem>
          <button mat-menu-item (click)="selected.emit(node)">{{ node.label }}</button>
        </ng-template>
      </ng-container>
    </mat-menu>
  `,
})
export class NestedMenuComponent {
  @Input() data: ListNodeV2;
  @Output() selected = new EventEmitter<ListNodeV2>();
}
