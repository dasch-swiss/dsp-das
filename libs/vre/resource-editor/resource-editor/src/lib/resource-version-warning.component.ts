import { Component, Input } from '@angular/core';

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

  displayCurrentVersion() {
    // this._resourceFetcher.
  }
}
