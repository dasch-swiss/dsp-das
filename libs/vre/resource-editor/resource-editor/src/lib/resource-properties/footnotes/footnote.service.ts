import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReadValue } from '@dasch-swiss/dsp-js';
import { unescapeHtml } from '@dasch-swiss/vre/ui/ui';

@Injectable()
export class FootnoteService {
  static readonly FOOTNOTE_REGEXP = /<footnote content="([^>]+)"\/>/g;
  uuid = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(); // make the service / propertyValue unique
  footnotes: SafeHtml[] = [];

  footnoteRead = 0;
  reloadToken = 0;

  addFootnote(content: SafeHtml) {
    this.footnotes.push(content);
  }

  private reset() {
    this.footnotes = [];
    this.footnoteRead = 0;
  }

  reloadFootnotes(values: ReadValue[], sanitizer: DomSanitizer) {
    this.reset();
    values.forEach(value => {
      if (value.strval === undefined) return;
      const matches = value.strval.matchAll(FootnoteService.FOOTNOTE_REGEXP);
      Array.from(matches).forEach(match => {
        this.addFootnote(sanitizer.bypassSecurityTrustHtml(unescapeHtml(match[1])));
      });
    });
    this.reloadToken++;
  }

  increaseReadFootnote() {
    this.footnoteRead++;
  }
}
