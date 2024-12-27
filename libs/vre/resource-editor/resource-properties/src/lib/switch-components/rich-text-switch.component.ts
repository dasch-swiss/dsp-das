import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadLinkValue } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { IsSwitchComponent } from './is-switch-component.interface';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-rich-text-switch',
  template: ` <div
      *ngIf="displayMode; else editMode"
      data-cy="rich-text-switch"
      [innerHTML]="sanitizedHtml"
      appFootnote></div>
    <ng-template #editMode>
      <app-ck-editor [control]="myControl" />
    </ng-template>`,
})
export class RichTextSwitchComponent implements IsSwitchComponent {
  @Input() control!: FormControl<string | null>;
  @Input() displayMode = true;

  sanitizedHtml = this._sanitizer.bypassSecurityTrustHtml(
    `<p>some text with <footnote content="heeey">*</footnote> the following.</p>`
  );

  get myControl() {
    return this.control as FormControl<string>;
  }

  constructor(
    private _resourceService: ResourceService,
    private _sanitizer: DomSanitizer
  ) {}

  _openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }
}
