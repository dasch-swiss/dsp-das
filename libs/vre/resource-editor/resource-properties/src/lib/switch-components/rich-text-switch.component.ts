import { Component, Input, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReadLinkValue } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { IsSwitchComponent } from './is-switch-component.interface';
import { FootnoteService } from '../footnote.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  sanitizedHtml!: SafeHtml;
  test = `This is julien <b>rich HTML</b> content!`;

  get myControl() {
    return this.control as FormControl<string>;
  }

  constructor(
    private _resourceService: ResourceService,
    private _sanitizer: DomSanitizer,
    @Optional() private _footnoteService: FootnoteService
  ) {
    // this._footnoteService?.addFootnote('testUid', 'heeey');
  }

  ngOnInit() {
    if (this.control.value) {
      this.sanitizedHtml = this._sanitizer.bypassSecurityTrustHtml(this.unescapeHtml(this.control.value));
    }
  }

  unescapeHtml(str: string) {
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
    };
    return str.replace(/&(amp|lt|gt|quot|#039);/g, match => unescapeMap[match]);
  }

  _openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }
}
