import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { unescapeHtml } from '@dasch-swiss/vre/ui/ui';
import { FootnoteService } from './footnote.service';

@Pipe({
  name: 'footnoteParser',
  pure: false,
})
export class FootnoteParserPipe implements PipeTransform {
  private readonly _footnoteRegExp = /<footnote content="([^>]+)"\/>/g;

  // Manual cache for impure pipe — avoids re-processing on every CD cycle
  private _lastInput: string | null = null;
  private _lastIndex = -1;
  private _lastFootnoteCount = -1;
  private _cachedResult: SafeHtml | null = null;

  constructor(
    private readonly _sanitizer: DomSanitizer,
    private readonly _footnoteService: FootnoteService
  ) {}

  transform(value_: null | string | SafeHtml, valueIndex: number): SafeHtml | null {
    if (value_ === null) {
      return value_;
    }

    const value =
      typeof value_ === 'string' ? value_ : (value_ as unknown as any)['changingThisBreaksApplicationSecurity'];

    // Return cached result if inputs unchanged AND footnotes weren't reset.
    // We use >= (not ===) because the pipe itself adds footnotes during parsing,
    // so the count naturally increases after transform(). A decrease means footnotes
    // were removed externally (e.g. via removeFootnotesForValue after reorder),
    // which should trigger a re-parse to assign correct footnote indices.
    const currentCount = this._footnoteService.footnotes.length;
    if (value === this._lastInput && valueIndex === this._lastIndex && currentCount >= this._lastFootnoteCount) {
      return this._cachedResult;
    }

    const previousIndex = this._lastIndex;
    this._lastInput = value;
    this._lastIndex = valueIndex;

    // Clean up footnotes registered under the old index before re-parsing
    if (previousIndex >= 0 && previousIndex !== valueIndex) {
      this._footnoteService.removeFootnotesForValue(previousIndex);
    }

    if (!this._containsFootnote(value)) {
      this._cachedResult = this._sanitizer.bypassSecurityTrustHtml(value);
      this._lastFootnoteCount = this._footnoteService.footnotes.length;
      return this._cachedResult;
    }

    this._cachedResult = this._parseFootnotes(value, valueIndex);
    this._lastFootnoteCount = this._footnoteService.footnotes.length;
    return this._cachedResult;
  }

  private _containsFootnote(text: string) {
    return text.match(this._footnoteRegExp) !== null;
  }

  private _parseFootnotes(controlValue: string, valueIndex: number): SafeHtml {
    const matches = controlValue.matchAll(this._footnoteRegExp);

    let newValue = controlValue;
    if (matches) {
      Array.from(matches).forEach((matchArray, indexFootnote) => {
        const footnoteId = `${this._footnoteService.uuid}-${valueIndex}-${indexFootnote}`;

        if (!this._footnoteAlreadyParsed(valueIndex, indexFootnote)) {
          this._footnoteService.addFootnote(
            valueIndex,
            indexFootnote,
            this._sanitizer.bypassSecurityTrustHtml(unescapeHtml(matchArray[1]))
          );
        }
        const startingIndex = this._footnoteService.footnotes.findIndex(footnote => footnote.indexValue === valueIndex);

        const parsedFootnote = `<footnote content="${matchArray[1]}" data-origin-uuid="${footnoteId}">${startingIndex + indexFootnote + 1}</footnote>`;
        newValue = newValue.replace(matchArray[0], parsedFootnote);
      });
    }

    return this._sanitizer.bypassSecurityTrustHtml(newValue);
  }

  private _footnoteAlreadyParsed(valueIndex: number, indexFootnote: number) {
    return this._footnoteService.footnotes.some(
      footnote => footnote.indexValue === valueIndex && footnote.indexFootnote === indexFootnote
    );
  }
}
