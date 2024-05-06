import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadValue } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-link-switch',
  template: ` <ng-container *ngIf="displayMode; else editMode"
      ><a [href]="link" target="_blank">{{ value }}</a>
    </ng-container>
    <ng-template #editMode>
      <app-link-value
        [control]="control"
        [propIri]="propIri"
        [resourceClassIri]="resourceClassIri"
        [defaultValue]="value"></app-link-value>
    </ng-template>`,
})
export class LinkSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string>;
  @Input() displayMode = true;
  @Input() propIri!: string;
  @Input() values: ReadValue[] | undefined;
  @Input({ required: true }) resourceClassIri!: string;

  get value() {
    return this.values && this.values.length > 0 ? (this.values as ReadValue[])[0].strval : '';
  }

  get link() {
    return `/resource${this._resourceService.getResourcePath(this.control.value)}`;
  }

  constructor(private _resourceService: ResourceService) {}
}
