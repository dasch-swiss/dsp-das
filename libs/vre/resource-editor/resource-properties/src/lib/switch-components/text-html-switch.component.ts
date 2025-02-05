import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-text-html-switch',
  template: ` <div
      *ngIf="displayMode; else editMode"
      data-cy="text-html-switch"
      [innerHTML]="control.value | internalLinkReplacer"
      appMathjax></div>
    <ng-template #editMode> This value cannot be edited.</ng-template>`,
})
export class TextHtmlSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;
}
