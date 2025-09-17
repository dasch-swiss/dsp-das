import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MultipleViewerService } from './multiple-viewer.service';
import { ResourceData } from './resource-browser.type';

@Component({
  selector: 'app-resource-browser',
  template: ` <div class="whole-height">
    <as-split direction="horizontal">
      <as-split-area [size]="40">
        <app-resources-list
          [resources]="resourceData.resources"
          [showBackToFormButton]="resourceData.isSearchResult === true" />
        @if (resourceData.resources.length === 0) {
          <div class="no-resources-message">
            @if (resourceData.isSearchResult) {
              {{ 'pages.dataBrowser.noResourcesForSearch' | translate }}
            } @else {
              {{ 'pages.dataBrowser.noResourcesForClass' | translate }}
            }
          </div>
        }
      </as-split-area>
      <as-split-area [size]="60" cdkScrollable>
        <app-multiple-viewer />
      </as-split-area>
    </as-split>
  </div>`,
  styleUrls: ['./resource-browser.component.scss'],
  providers: [MultipleViewerService],
})
export class ResourceBrowserComponent implements OnInit, OnChanges {
  @Input({ required: true }) resourceData!: ResourceData;
  @Input({ required: true }) hasRightsToShowCreateLinkObject$!: Observable<boolean>;
  @Input() searchKeyword?: string;

  constructor(private _multipleViewerService: MultipleViewerService) {}

  ngOnInit() {
    this._multipleViewerService.searchKeyword = this.searchKeyword;
    this._multipleViewerService.onInit(this.hasRightsToShowCreateLinkObject$);
  }

  ngOnChanges() {
    if (
      !this._multipleViewerService.selectMode &&
      this.resourceData.selectFirstResource &&
      this.resourceData.resources.length > 0
    ) {
      this._multipleViewerService.selectOneResource(this.resourceData.resources[0]);
    }
  }
}
