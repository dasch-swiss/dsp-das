import { Component } from '@angular/core';
import { MultipleViewerService } from './comparison/multiple-viewer.service';

@Component({
  selector: 'app-resource-class-browser-page-2',
  template: `<div style="display: flex; height: 100%">
    <app-project-sidenav />
    <div style="flex: 1; display: flex; justify-content: center">
      <app-multiple-viewer style="flex: 1" />
    </div>
  </div> `,
  providers: [MultipleViewerService],
})
export class ResourceClassBrowserPage2Component {}
