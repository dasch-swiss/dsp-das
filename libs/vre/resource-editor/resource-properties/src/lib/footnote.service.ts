import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable()
export class FootnoteService {
  footnotes: { uid: string; content: SafeHtml }[] = [];

  addFootnote(uid: string, content: SafeHtml): void {
    this.footnotes.push({ uid, content });
  }

  reset() {
    this.footnotes = [];
  }
}
