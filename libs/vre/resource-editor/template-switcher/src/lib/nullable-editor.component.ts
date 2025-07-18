import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nullable-editor',
  template: ` <ng-content *ngIf="control.value !== null; else addTpl" />
    <ng-template #addTpl>
      <button mat-icon-button (click)="control.setValue(defaultValue)" title="Add">
        <mat-icon>add_box</mat-icon>
      </button>
    </ng-template>`,
})
export class NullableEditorComponent {
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) defaultValue!: unknown;
}
