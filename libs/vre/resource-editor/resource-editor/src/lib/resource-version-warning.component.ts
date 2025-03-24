import { Component } from '@angular/core';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-resource-version-warning',
  template: ` <div>Warning, you are watching a resource dating from {{ resourceVersion }}</div>
    <button mat-button (click)="displayCurrentVersion()">See current version.</button>`,
})
export class ResourceVersionWarningComponent {
  constructor(private _resourceFetcher: ResourceFetcherService) {}

  displayCurrentVersion() {
    // this._resourceFetcher.
  }
}
