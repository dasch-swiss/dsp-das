import { Component, Input } from '@angular/core';
import { ReadTextValueAsHtml } from '@dasch-swiss/dsp-js';
import { InternalLinkReplacerPipe, AddTargetBlankPipe } from '@dasch-swiss/vre/ui/ui';
import { MathJaxDirective } from '../mathjax/math-jax.directive';

@Component({
  selector: 'app-text-html-viewer',
  template: `
    <div data-cy="text-html-switch" [innerHTML]="value.html | internalLinkReplacer | addTargetBlank" appMathjax></div>
  `,
  standalone: true,
  imports: [MathJaxDirective, InternalLinkReplacerPipe, AddTargetBlankPipe],
})
export class TextHtmlViewerComponent {
  @Input({ required: true }) value!: ReadTextValueAsHtml;
}
