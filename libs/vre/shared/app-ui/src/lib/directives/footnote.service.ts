import { Injectable } from '@angular/core';

@Injectable()
export class FootnoteService {
  footnotes: { uid: string; content: string }[] = [];

  addFootnote(uid: string, content: string): void {
    this.footnotes.push({ uid, content });
  }

  reset() {
    this.footnotes = [];
  }
}
