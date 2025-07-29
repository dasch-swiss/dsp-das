import { Component, Input, OnInit } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';
import { SplitSize } from './split-size.interface';

@Component({
  selector: 'app-multiple-viewer-gateway',
  template: ` <div class="multiple-instances">
    <as-split direction="horizontal" (dragEnd)="splitSizeChanged = $event">
      <as-split-area [size]="40">
        <app-list-view-normal [resources]="resources" />
      </as-split-area>
      <as-split-area [size]="60" cdkScrollable>
        <app-multiple-viewer-2 />
      </as-split-area>
    </as-split>
  </div>`,
  styleUrls: ['./multiple-viewer-gateway.component.scss'],
  providers: [MultipleViewerService],
})
export class MultipleViewerGatewayComponent implements OnInit {
  @Input({ required: true }) resources!: ReadResource[];

  splitSizeChanged: SplitSize | undefined = undefined;

  constructor(private _multipleViewerService: MultipleViewerService) {}

  ngOnInit() {
    if (this.resources.length > 0) {
      this._multipleViewerService.selectOneResource(this.resources[0]);
    }
  }
}
