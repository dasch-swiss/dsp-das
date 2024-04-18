import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadValue } from '@dasch-swiss/dsp-js';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-link-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode"
      ><a [href]="control.value">{{ value }}</a>
    </ng-container>
    <ng-template #editMode>
      <app-link-value [control]="control" [propIri]="propIri"></app-link-value>
    </ng-template>`,
})
export class LinkSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
  @Input() propIri!: string;
  @Input() values: ReadValue[] | undefined;

  get value() {
    return (this.values as ReadValue[])[0].strval;
  }
}
