import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { AsyncPipe } from '@angular/common';
import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { Constants, ReadAudioFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { getFileValue } from '../get-file-value';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceFetcherService } from '../resource-fetcher.service';

@Component({
  selector: 'app-audio-more-button',
  template: ` <button mat-icon-button [matMenuTriggerFor]="more">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #more="matMenu" class="representation-menu">
      <button mat-menu-item (click)="openIIIFnewTab()">Open audio in new tab</button>
      <button mat-menu-item [cdkCopyToClipboard]="fileValue.fileUrl">Copy audio URL to clipboard</button>
      <button mat-menu-item (click)="download()">Download audio</button>
      @if (resourceFetcherService.userCanEdit$ | async) {
        <button mat-menu-item (click)="openReplaceFileDialog()">Replace file</button>
      }
    </mat-menu>`,
  standalone: true,
  imports: [MatIconButton, MatMenuTrigger, MatIcon, MatMenu, MatMenuItem, CdkCopyToClipboard, AsyncPipe],
})
export class AudioMoreButtonComponent {
  @Input({ required: true }) parentResource!: ReadResource;

  get fileValue() {
    return getFileValue(this.parentResource) as ReadAudioFileValue;
  }

  constructor(
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    private _viewContainerRef: ViewContainerRef,
    public resourceFetcherService: ResourceFetcherService
  ) {}

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        title: 'Audio',
        subtitle: 'Update the audio file of this resource',
        representation: Constants.HasAudioFileValue,
        resource: this.parentResource,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  openIIIFnewTab() {
    window.open(this.fileValue.fileUrl, '_blank');
  }

  download() {
    this._rs.downloadProjectFile(this.fileValue, this.parentResource);
  }
}
