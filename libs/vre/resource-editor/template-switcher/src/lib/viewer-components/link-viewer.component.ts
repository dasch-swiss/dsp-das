import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadLinkValue, ReadValue } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-link-viewer',
  template: `<a [href]="link" target="_blank" data-cy="link-switch">{{ myValue }}</a> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkViewerComponent {
  @Input({ required: true }) control!: FormControl<string>;
  @Input({ required: true }) value!: ReadValue;

  get myValue() {
    // TODO changed from original
    return (this.value as ReadLinkValue).strval;
  }

  get link() {
    return this.control.value ? `/resource${this._resourceService.getResourcePath(this.control.value)}` : '#';
  }

  constructor(private _resourceService: ResourceService) {}
}
