import { Injectable } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Injectable()
export class FootnoteService {
  get footnotesList() {
    return this.footnotes.reduce(
      (acc, footnoteBlock) => {
        return acc.concat(footnoteBlock.values);
      },
      [] as { uid: string; content: SafeHtml }[]
    );
  }

  footnotes: { propertyUid: string; values: { uid: string; content: SafeHtml }[] }[] = [];

  addFootnote(propertyId: string, uid: string, content: SafeHtml): void {
    const property = this.footnotes.find(footnote => footnote.propertyUid === propertyId);
    if (property) {
      const value = property.values.find(footnote => footnote.uid === uid);
      if (value) {
        value.content = content;
      } else {
        property.values.push({ uid, content });
      }
    } else {
      this.footnotes.push({ propertyUid: propertyId, values: [{ uid, content }] });
    }
  }

  reset() {
    this.footnotes = [];
  }
}
