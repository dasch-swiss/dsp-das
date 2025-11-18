import { Component, EventEmitter, Input, Output } from '@angular/core';
import { APIV3ApiService } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { PropertyInfoValues } from '@dasch-swiss/vre/shared/app-common';

@Component({
  selector: 'app-download-dialog-properties-tab',
  standalone: false,
  template: `
    <app-download-property-list [propertyDefinitions]="properties" (propertiesChange)="selectedPropertyIds = $event" />

    <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 4px">
      <mat-checkbox [(ngModel)]="includeResourceIris">
        <span style="font-weight: 500">Include Resource IRIs for reference properties</span>
      </mat-checkbox>
      <p style="margin: 8px 0 0 32px; color: #666; font-size: 13px">
        When enabled, reference properties export both human-readable values (e.g., 'Alice') and Resource IRIs for
        proper data referencing.
      </p>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="afterClosed.emit()" style="margin-right: 16px">Cancel</button>
      <button mat-raised-button color="primary" (click)="downloadCsv()">
        <mat-icon>download</mat-icon>
        Download CSV
      </button>
    </div>
  `,
})
export class DownloadDialogResourcesTabComponent {
  @Input({ required: true }) properties!: PropertyInfoValues[];
  @Input({ required: true }) resourceClassIri!: string;
  @Output() afterClosed = new EventEmitter<void>();
  includeResourceIris = false;

  selectedPropertyIds: string[] = [];

  constructor(private _v3: APIV3ApiService) {}

  downloadCsv(): void {
    this._v3
      .postV3ExportResources(
        {
          resourceClass: this.resourceClassIri,
          selectedProperties: this.selectedPropertyIds,
          language: 'en',
          includeResourceIri: this.includeResourceIris,
        },
        undefined,
        undefined,
        { httpHeaderAccept: 'text/csv' }
      )
      .subscribe(csvText => {
        this._createBlob(csvText);
      });
  }

  private _createBlob(csvText: string) {
    const blob = new Blob([csvText], { type: 'text/csv' });
    const filename = `resources_export_${new Date().toISOString().split('T')[0]}.csv`;

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  }
}
