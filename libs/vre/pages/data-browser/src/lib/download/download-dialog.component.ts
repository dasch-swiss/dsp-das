import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DownloadProperty } from './download-property-list.component';

export interface DownloadDialogData {
  properties: DownloadProperty[];
  resourceCount: number;
}

@Component({
  selector: 'app-download-dialog',
  template: `
    <app-dialog-header [title]="'Download'" [subtitle]="data.resourceCount + ' resources available'" />

    <div style="display: flex; justify-content: center">
      <app-double-chip-selector [options]="['Resources', 'Images']" [(value)]="isResourcesMode" />
    </div>
    <div mat-dialog-content>
      <app-download-property-list [(properties)]="properties" />

      <div style="margin-top: 16px; padding: 16px; background: #f5f5f5; border-radius: 4px">
        <mat-checkbox [(ngModel)]="includeResourceIris">
          <span style="font-weight: 500">Include Resource IRIs for reference properties</span>
        </mat-checkbox>
        <p style="margin: 8px 0 0 32px; color: #666; font-size: 13px">
          When enabled, reference properties export both human-readable values (e.g., 'Alice') and Resource IRIs for
          proper data referencing.
        </p>
      </div>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()" style="margin-right: 16px">Cancel</button>
      <button mat-raised-button color="primary" (click)="downloadCsv()">
        <mat-icon>download</mat-icon>
        Download CSV
      </button>
    </div>
  `,
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class DownloadDialogComponent {
  isResourcesMode = true;
  includeResourceIris = false;
  properties: DownloadProperty[] = [];

  constructor(
    public dialogRef: MatDialogRef<DownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DownloadDialogData
  ) {
    this.properties = [...data.properties];
  }

  downloadCsv(): void {
    const selectedProperties = this.properties.filter(p => p.selected);
    this.dialogRef.close({
      downloadType: this.isResourcesMode ? 'resources' : 'images',
      selectedProperties,
      includeResourceIris: this.includeResourceIris,
    });
  }
}
