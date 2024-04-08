import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SwitchComponent } from './switch-component.interface';

@Component({
  selector: 'app-link-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode"
      ><a [href]="control.value">{{ control.value }}</a>
    </ng-container>
    <ng-template #editMode>
      <app-link-value-2 [control]="control" [propIri]="propIri"></app-link-value-2>
    </ng-template>`,
})
export class LinkSwitchComponent implements SwitchComponent {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
  @Input() propIri!: string;
}
