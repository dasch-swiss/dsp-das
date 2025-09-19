import { Component, Input, Inject } from '@angular/core';
import { ReadTextValueAsXml } from '@dasch-swiss/dsp-js';
import { FootnoteProcessorInterface } from '@dasch-swiss/vre/core/session';
import { InternalLinkReplacerPipe, AddTargetBlankPipe } from '@dasch-swiss/vre/ui/ui';
import { SimpleFootnoteProcessorService } from '../simple-footnote-processor.service';

@Component({
  selector: 'app-rich-text-viewer',
  template: `
    <div
      data-cy="rich-text-switch"
      class="rich-text-viewer"
      [innerHTML]="processedContent | internalLinkReplacer | addTargetBlank"></div>
  `,
  styles: [
    `
      .rich-text-viewer {
        overflow-wrap: break-word;
        word-break: break-word;

        ::ng-deep * {
          &:first-child {
            margin-top: 0;
          }

          &:last-child {
            margin-bottom: 0;
          }

          footnote {
            color: #336790;
            vertical-align: super;
            font-size: x-small;
            cursor: pointer;
          }
        }
      }
    `,
  ],
  standalone: true,
  imports: [InternalLinkReplacerPipe, AddTargetBlankPipe],
  providers: [{ provide: FootnoteProcessorInterface, useClass: SimpleFootnoteProcessorService }],
})
export class RichTextViewerComponent {
  @Input({ required: true }) value!: ReadTextValueAsXml;
  @Input({ required: true }) index!: number;

  constructor(
    @Inject(FootnoteProcessorInterface)
    private _footnoteProcessor: FootnoteProcessorInterface
  ) {}

  get processedContent() {
    return this._footnoteProcessor.processFootnotes(this.value.strval || '', this.index);
  }
}
