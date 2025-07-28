import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { SplitSize } from './split-size.interface';

@Component({
  selector: 'app-multiple-viewer-gateway',
  template: ` <as-split direction="horizontal" (dragEnd)="splitSizeChanged = $event">
    <as-split-area [size]="40">
      <app-list-view-normal [resources]="resources" />
    </as-split-area>
    <as-split-area [size]="60" cdkScrollable>
      <app-multiple-viewer-2 [resources]="resources" />
    </as-split-area>
  </as-split>`,
})
export class MultipleViewerGatewayComponent {
  @Input({ required: true }) resources!: ReadResource[];

  splitSizeChanged: SplitSize | undefined = undefined;
}
