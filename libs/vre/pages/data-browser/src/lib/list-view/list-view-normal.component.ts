import { Component, Input } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';
import { MultipleViewerService } from '../multiple-viewer.service';
import { ResourceClassBrowserPageService } from '../resource-class-browser/resource-class-browser-page.service';

@Component({
  selector: 'app-list-view-normal',
  template: ` <app-pager (pageIndexChanged)="updatePageIndex($event)" [numberOfAllResults]="200" />
    <app-resource-list-selection *ngIf="multipleViewerService.selectMode" [resources]="resources" />
    <app-resource-list [resources]="resources" />`,
})
export class ListViewNormalComponent {
  @Input({ required: true }) resources!: ReadResource[];

  constructor(
    public multipleViewerService: MultipleViewerService,
    private _resourceClassBrowserPageService: ResourceClassBrowserPageService
  ) {}

  updatePageIndex(index: number) {
    this._resourceClassBrowserPageService.updatePageIndex(index);
  }
}
