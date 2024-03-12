import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListNodeV2 } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-nested-menu',
  template: `
    <button *ngIf="data.isRootNode" mat-button [matMenuTriggerFor]="menu">
      {{ selection ?? 'Select a list in "' + data.label + '"' }}
    </button>
    <div *ngIf="!data.isRootNode" mat-menu-item [matMenuTriggerFor]="menu" style="width: 100%">
      {{ data.label }}
    </div>
    <mat-menu #menu="matMenu">
      <ng-container *ngFor="let node of data.children; let i = index">
        <button mat-menu-item style="padding: 0" *ngIf="node.children.length > 0; else menuItem">
          <app-nested-menu [data]="node" (selectedNode)="selectedNode.emit($event)"></app-nested-menu>
        </button>
        <ng-template #menuItem>
          <button mat-menu-item (click)="selectedNode.emit(node)" style="padding: 0 16px">{{ node.label }}</button>
        </ng-template>
      </ng-container>
    </mat-menu>
  `,
  styles: [
    `
      ::ng-deep span.mat-mdc-menu-item-text {
        width: 100%;
      }
    `,
  ],
})
export class NestedMenuComponent {
  @Input() data: ListNodeV2;
  @Input() selection: string;
  @Output() selectedNode = new EventEmitter<ListNodeV2>();
}
