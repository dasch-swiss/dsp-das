import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { Observable, of } from 'rxjs';
import { MultipleViewerService } from './multiple-viewer.service';

@Component({
  selector: 'app-multiple-viewer-gateway',
  template: ` <div class="multiple-instances">
    <as-split direction="horizontal">
      <as-split-area [size]="40">
        <app-list-view-normal [resources]="data.resources" />
      </as-split-area>
      <as-split-area [size]="60" cdkScrollable>
        <app-multiple-viewer />
      </as-split-area>
    </as-split>
  </div>`,
  styleUrls: ['./multiple-viewer-gateway.component.scss'],
  providers: [MultipleViewerService],
})
export class MultipleViewerGatewayComponent implements OnInit, OnChanges {
  @Input({ required: true }) data!: { resources: ReadResource[]; selectFirstResource: boolean };
  @Input() hasRightsToShowCreateLinkObject$?: Observable<boolean>;
  @Input() searchKeyword?: string;

  constructor(private _multipleViewerService: MultipleViewerService) {}

  ngOnInit() {
    this._multipleViewerService.searchKeyword = this.searchKeyword;
    this._multipleViewerService.onInit(this.hasRightsToShowCreateLinkObject$ ?? of(true));
  }
  ngOnChanges() {
    if (this.data.selectFirstResource && this.data.resources.length > 0) {
      this._multipleViewerService.selectOneResource(this.data.resources[0]);
    }
    console.log('aaa', this);
  }
}
