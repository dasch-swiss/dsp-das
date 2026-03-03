import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { ReadFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { RepresentationService } from './representation.service';

@Component({
  selector: 'app-download-menu-item',
  standalone: true,
  imports: [MatButton, MatIcon, MatMenuTrigger, MatMenu, MatMenuItem],
  template: `
    <div class="split-button-container">
      <button mat-flat-button class="main-button">
        <mat-icon>download</mat-icon>
        Download File
      </button>

      <button mat-flat-button class="arrow-button" [matMenuTriggerFor]="menu">
        <mat-icon>arrow_drop_down</mat-icon>
      </button>
    </div>

    <mat-menu #menu="matMenu" xPosition="before">
      <button mat-menu-item>
        <mat-icon>link</mat-icon>
        <span>Copy link</span>
      </button>
    </mat-menu>
  `,
  styles: [
    `
      .split-button-container {
        display: inline-flex;
        align-items: stretch;
        overflow: hidden;

        .main-button {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.2); /* Subtle separator */
        }

        .arrow-button {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          min-width: 40px;
          padding: 0 4px;
        }
      }
    `,
  ],
})
export class DownloadMenuItemComponent {
  @Input({ required: true }) src!: ReadFileValue;
  @Input({ required: true }) parentResource!: ReadResource;

  copied = signal(false);
  copyStatus = signal('Copy URL to clipboard');

  constructor(
    private readonly _rs: RepresentationService,
    private _clipboard: Clipboard
  ) {}

  download() {
    this._rs.downloadProjectFile(this.src, this.parentResource);
  }

  copyUrl() {
    const url = this.src.fileUrl; // Assuming fileUrl exists on ReadFileValue
    if (this._clipboard.copy(url)) {
      this.copied.set(true);
      this.copyStatus.set('Copied!');

      // Reset after 2 seconds
      setTimeout(() => {
        this.copied.set(false);
        this.copyStatus.set('Copy URL to clipboard');
      }, 2000);
    }
  }
}
