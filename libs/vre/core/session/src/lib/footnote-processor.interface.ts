import { SafeHtml } from '@angular/platform-browser';

export abstract class FootnoteProcessorInterface {
  abstract processFootnotes(value: string | SafeHtml, valueIndex: number): SafeHtml | null;
}
