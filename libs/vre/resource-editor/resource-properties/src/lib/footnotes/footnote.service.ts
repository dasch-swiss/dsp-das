import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable()
export class FootnoteService {
  footnotes: { indexValue: number; indexFootnote: number; content: SafeHtml }[] = [];

  addFootnote(indexValue: number, indexFootnote: number, content: SafeHtml) {
    this.footnotes.push({ indexValue, indexFootnote, content });
  }

  reset() {
    this.footnotes = [];
  }
}
