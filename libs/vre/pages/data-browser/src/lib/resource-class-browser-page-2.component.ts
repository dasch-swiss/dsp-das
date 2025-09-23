import { Component } from '@angular/core';
import { MultipleViewerService } from './comparison/multiple-viewer.service';

@Component({
  selector: 'app-resource-class-browser-page-2',
  template: `<div style="height: 100%">
    @if (multipleViewerService.selectMode) {
      <app-resource-list-selection />
    }
    <div style="display: flex">
      <app-project-sidenav />
      <div style="flex: 1; display: flex; justify-content: center">
        <app-multiple-viewer style="flex: 1" />
      </div>
    </div>
  </div> `,
  providers: [MultipleViewerService],
})
export class ResourceClassBrowserPage2Component {
  constructor(public multipleViewerService: MultipleViewerService) {}
}
