import { Component, Input, OnInit } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-gateway-search',
  template: `
    <div class="multiple-instances">
      <as-split direction="horizontal">
        <as-split-area [size]="40">
          <app-list-view-normal [resources]="resources" />
        </as-split-area>
        <as-split-area [size]="60" cdkScrollable>
          <app-multiple-viewer />
        </as-split-area>
      </as-split>
    </div>
  `,
  styleUrls: ['./multiple-viewer-gateway-search.component.scss'],
  providers: [MultipleViewerService],
})
export class MultipleViewerGatewaySearchComponent implements OnInit {
  @Input({ required: true }) resources!: ReadResource[];

  constructor(private _multipleViewerService: MultipleViewerService) {}

  ngOnInit() {
    if (this.resources.length > 0) {
      this._multipleViewerService.selectOneResource(this.resources[0]);
    }
  }
}
