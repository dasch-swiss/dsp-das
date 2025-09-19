import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FootnoteProcessorInterface } from '@dasch-swiss/vre/core/session';

@Injectable({
  providedIn: 'root',
})
export class SimpleFootnoteProcessorService implements FootnoteProcessorInterface {
  private readonly _footnoteRegExp = /<footnote content="([^>]+)"\/>/g;

  constructor(private _sanitizer: DomSanitizer) {}

  processFootnotes(value_: string | SafeHtml, valueIndex: number): SafeHtml | null {
    if (value_ === null) {
      return value_ as SafeHtml;
    }

    const value = typeof value_ === 'string' ? value_ : value_['changingThisBreaksApplicationSecurity'];
    if (!this._containsFootnote(value)) {
      return this._sanitizer.bypassSecurityTrustHtml(value);
    }

    return this._parseFootnotes(value, valueIndex);
  }

  private _containsFootnote(text: string) {
    return text.match(this._footnoteRegExp) !== null;
  }

  private _parseFootnotes(controlValue: string, valueIndex: number): SafeHtml {
    const matches = controlValue.matchAll(this._footnoteRegExp);
    let newValue = controlValue;

    if (matches) {
      let footnoteIndex = 1;
      Array.from(matches).forEach(matchArray => {
        const parsedFootnote = `<span style="color: #336790; vertical-align: super; font-size: x-small; cursor: pointer;" title="${matchArray[1]}">${footnoteIndex}</span>`;
        newValue = newValue.replace(matchArray[0], parsedFootnote);
        footnoteIndex++;
      });
    }

    return this._sanitizer.bypassSecurityTrustHtml(newValue);
  }
}
