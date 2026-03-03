import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ReadFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslatePipe } from '@ngx-translate/core';
import { RepresentationService } from './representation.service';

@Component({
  selector: 'app-download-menu-item',
  standalone: true,
  imports: [MatButton, MatIcon, TranslatePipe],
  template: `
    <div style="display: flex; gap: 16px">
      <button mat-flat-button (click)="download()">
        <mat-icon>download</mat-icon>
        {{ 'resourceEditor.representations.downloadFile' | translate }}
      </button>

      <button mat-flat-button (click)="copyUrl()">
        <mat-icon>link</mat-icon>
        Copy link
      </button>
    </div>
  `,
})
export class DownloadMenuItemComponent {
  @Input({ required: true }) src!: ReadFileValue;
  @Input({ required: true }) parentResource!: ReadResource;

  constructor(
    private readonly _rs: RepresentationService,
    private _clipboard: Clipboard,
    private readonly _notification: NotificationService
  ) {}

  download() {
    this._rs.downloadProjectFile(this.src, this.parentResource);
  }

  copyUrl() {
    this._rs.getIngestUrl(this.src, this.parentResource).subscribe(link => {
      this._clipboard.copy(link);
      this._notification.openSnackBar('File link copied to clipboard');
    });
  }
}
