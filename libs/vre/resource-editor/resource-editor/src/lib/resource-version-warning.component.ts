import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-resource-version-warning',
  template: `
    <div style="display: flex; justify-content: center">
      <div style="padding: 16px; border: 1px solid #f44336; border-radius: 4px; margin-top: 16px">
        <div>Warning, you are watching a resource dating from {{ resourceVersion }}</div>
        <button mat-button color="primary" (click)="displayCurrentVersion()">See current version.</button>
      </div>
    </div>
  `,
})
export class ResourceVersionWarningComponent {
  @Input({ required: true }) resourceVersion!: string;

  constructor(
    private _router: Router,
    private _resourceFetcherService: ResourceFetcherService
  ) {}

  displayCurrentVersion() {
    this.removeQueryParam().then(() => {
      this._resourceFetcherService.reload();
    });
  }

  removeQueryParam() {
    return this._router.navigate([], {
      queryParams: { version: null }, // Set parameter to null to remove it
      queryParamsHandling: 'merge',
    });
  }
}
