import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-boolean-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode">{{ control.value }}</ng-container>
    <ng-template #editMode>
      <mat-slide-toggle [formControl]="control"></mat-slide-toggle>
    </ng-template>`,
})
export class BooleanSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<boolean>;
  @Input() displayMode = true;
}
