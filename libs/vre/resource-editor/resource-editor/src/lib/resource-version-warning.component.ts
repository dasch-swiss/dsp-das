import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ResourceFetcherService } from '@dasch-swiss/vre/resource-editor/representations';

@Component({
  selector: 'app-resource-version-warning',
  template: `
    <div style="display: flex; justify-content: center">
      <div style="padding: 16px; border: 1px solid #f44336; border-radius: 4px; margin-top: 16px">
        <div style="display: flex; align-items: center">
          You are watching a resource dating from {{ resourceVersion }}.
          <button mat-button color="primary" (click)="displayCurrentVersion()">See current version</button>
        </div>
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
    this._removeQueryParam().then(() => {
      this._resourceFetcherService.reload();
    });
  }

  private _removeQueryParam() {
    return this._router.navigate([], {
      queryParams: { version: null }, // Set parameter to null to remove it
      queryParamsHandling: 'merge',
    });
  }
}
