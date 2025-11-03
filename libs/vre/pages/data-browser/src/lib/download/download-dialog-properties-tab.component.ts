import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DownloadProperty } from './download-property-list.component';

@Component({
  selector: 'app-download-dialog-properties-tab',
  standalone: false,
  template: `
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

    <div mat-dialog-actions align="end">
      <button mat-button (click)="afterClosed.emit()" style="margin-right: 16px">Cancel</button>
      <button mat-raised-button color="primary" (click)="downloadCsv()">
        <mat-icon>download</mat-icon>
        Download CSV
      </button>
    </div>
  `,
})
export class DownloadDialogPropertiesTabComponent {
  @Input({ required: true }) properties: DownloadProperty[];
  @Output() afterClosed = new EventEmitter<void>();
  includeResourceIris = false;

  downloadCsv(): void {
    const selectedProperties = this.properties.filter(p => p.selected);
    this.afterClosed.emit();
  }
}
