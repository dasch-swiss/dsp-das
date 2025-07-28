import { Component } from '@angular/core';
import { SplitSize } from './split-size.interface';

@Component({
  selector: 'app-multiple-viewer-gateway',
  template: ` <as-split direction="horizontal" (dragEnd)="splitSizeChanged = $event">
    <as-split-area [size]="40">
      LIST VIEW
      <app-list-view-normal />
    </as-split-area>
    <as-split-area [size]="60" cdkScrollable>
      MULTIPLE VIEWER
      <app-multiple-viewer-2 />
    </as-split-area>
  </as-split>`,
})
export class MultipleViewerGatewayComponent {
  splitSizeChanged: SplitSize | undefined = undefined;
}
