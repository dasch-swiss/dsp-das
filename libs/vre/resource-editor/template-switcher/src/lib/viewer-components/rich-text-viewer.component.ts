import { Component, Input } from '@angular/core';
import { ReadTextValueAsXml } from '@dasch-swiss/dsp-js';
import { FootnoteDirective, FootnoteParserPipe } from '@dasch-swiss/vre/resource-editor/resource-properties';
import { InternalLinkReplacerPipe, AddTargetBlankPipe } from '@dasch-swiss/vre/ui/ui';

@Component({
  selector: 'app-rich-text-viewer',
  template: `
    <div
      data-cy="rich-text-switch"
      class="rich-text-viewer"
      [innerHTML]="value.strval || '' | footnoteParser: index | internalLinkReplacer | addTargetBlank"
      appFootnote></div>
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
  imports: [FootnoteDirective, FootnoteParserPipe, InternalLinkReplacerPipe, AddTargetBlankPipe],
})
export class RichTextViewerComponent {
  @Input({ required: true }) value!: ReadTextValueAsXml;
  @Input({ required: true }) index!: number;
}
