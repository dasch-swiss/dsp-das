import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable()
export class FootnoteService {
  static readonly FOOTNOTE_REGEXP = /<footnote content="([^>]+)"\/>/g;
  uuid = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(); // make the service / propertyValue unique
  footnotes: SafeHtml[] = [];

  footnoteRead = 0;

  addFootnote(content: SafeHtml) {
    this.footnotes.push(content);
  }

  reset() {
    this.footnotes = [];
    this.footnoteRead = 0;
  }

  increaseReadFootnote() {
    this.footnoteRead++;
  }
}
