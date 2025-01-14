import { Component, Input, OnChanges, Optional } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReadLinkValue } from '@dasch-swiss/dsp-js';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FootnoteService } from '../footnote.service';
import { IsSwitchComponent } from './is-switch-component.interface';

@Component({
  selector: 'app-rich-text-switch',
  template: ` <div
      *ngIf="displayMode; else editMode"
      data-cy="rich-text-switch"
      [innerHTML]="sanitizedHtml"
      appFootnote
      appHtmlLink
      (internalLinkClicked)="openResource($event)"></div>
    <ng-template #editMode>
      <app-ck-editor [control]="myControl" />
    </ng-template>`,
  styles: [
    `
      :host ::ng-deep footnote {
        font-size: 0.8em;
        vertical-align: super;
        visibility: visible;
        position: relative;
        top: -6px;
        left: 2px;
        color: #336790;
        cursor: pointer;
        display: inline-block;
        padding: 0 2px;
      }
    `,
  ],
})
export class RichTextSwitchComponent implements IsSwitchComponent, OnChanges {
  @Input({ required: true }) control!: FormControl<string | null>;
  @Input() displayMode = true;

  sanitizedHtml!: SafeHtml;

  get myControl() {
    return this.control as FormControl<string>;
  }

  constructor(
    private _resourceService: ResourceService,
    private _sanitizer: DomSanitizer,
    @Optional() private _footnoteService: FootnoteService
  ) {}

  ngOnChanges() {
    if (this.control.value && this.displayMode) {
      this._parseFootnotes(this.control.value);
    } else {
      this.sanitizedHtml = this._sanitizer.bypassSecurityTrustHtml(this.control.value!);
    }
  }

  openResource(linkValue: ReadLinkValue | string) {
    const iri = typeof linkValue == 'string' ? linkValue : linkValue.linkedResourceIri;
    const path = this._resourceService.getResourcePath(iri);
    window.open(`/resource${path}`, '_blank');
  }

  private _parseFootnotes(controlValue: string) {
    const regex = /<footnote content="([^>]+)">([^<]*)<\/footnote>/g;
    const matches = controlValue.matchAll(regex);
    let newValue = controlValue;
    if (matches) {
      Array.from(matches).forEach(matchArray => {
        const uid = Math.random().toString(36).substring(7);
        const parsedFootnote = `<footnote content="${matchArray[1]}" id="${uid}">${this._footnoteService.footnotes.length + 1}</footnote>`;
        newValue = newValue.replace(matchArray[0], parsedFootnote);
        this._footnoteService.addFootnote(
          uid,
          this._sanitizer.bypassSecurityTrustHtml(this._unescapeHtml(this._unescapeHtml(matchArray[1])))
        );
      });
    }
    this.sanitizedHtml = this._sanitizer.bypassSecurityTrustHtml(this._unescapeHtml(newValue));
  }

  private _unescapeHtml(str: string) {
    const unescapeMap = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#039;': "'",
    };
    return str.replace(/&(amp|lt|gt|quot|#039);/g, match => unescapeMap[match]);
  }
}
