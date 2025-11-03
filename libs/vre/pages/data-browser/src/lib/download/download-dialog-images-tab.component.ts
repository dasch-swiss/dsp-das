import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-download-dialog-images-tab',
  standalone: false,
  template: `
    IMAGES

    <div mat-dialog-actions align="end">
      <button mat-button (click)="afterClosed.emit()" style="margin-right: 16px">Cancel</button>
      <button mat-raised-button color="primary">
        <mat-icon>download</mat-icon>
        WIP
      </button>
    </div>
  `,
})
export class DownloadDialogImagesTabComponent {
  @Output() afterClosed = new EventEmitter<void>();
}
