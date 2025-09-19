import { Component, Input } from '@angular/core';
import { ReadTextValueAsString } from '@dasch-swiss/dsp-js';
import { WithBreaksPipe } from '@dasch-swiss/vre/core/config';

@Component({
  selector: 'app-paragraph-viewer',
  template: `<span [innerHTML]="value.text | withBreaks"></span>`,
  standalone: true,
  imports: [WithBreaksPipe],
})
export class ParagraphViewerComponent {
  @Input({ required: true }) value!: ReadTextValueAsString;
}
