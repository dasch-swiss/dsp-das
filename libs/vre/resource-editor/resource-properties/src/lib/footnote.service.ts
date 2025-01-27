import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';

@Injectable()
export class FootnoteService {
  footnotes: { uid: string; content: SafeHtml }[] = [];
  private _onResetSubject = new Subject<void>();
  onReset$ = this._onResetSubject.asObservable();

  addFootnote(uid: string, content: SafeHtml): void {
    const property = this.footnotes.find(footnote => footnote.uid === uid);
    if (property) {
      property.content = content;
    } else {
      this.footnotes.push({ uid, content });
    }
  }

  reset() {
    this.footnotes = [];
    this._onResetSubject.next();
  }
}
