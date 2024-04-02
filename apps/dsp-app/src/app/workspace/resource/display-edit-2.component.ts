import { Component, Input } from '@angular/core';
import { ReadValue } from '@dasch-swiss/dsp-js';

@Component({
  selector: 'app-display-edit-2',
  template: `
    <app-switch-values *ngIf="displayMode; else editMode" [value]="val">DISPLAY VALUE</app-switch-values>
    <ng-template #editMode>
      EDIT
      <!--<app-switch-properties-3></app-switch-properties-3>-->
    </ng-template>
    <button (click)="displayMode = !displayMode">TOGGLE</button>
  `,
})
export class DisplayEdit2Component {
  @Input() val: ReadValue;
  displayMode = true;
}
