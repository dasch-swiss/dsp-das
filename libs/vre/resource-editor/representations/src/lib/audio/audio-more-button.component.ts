import { Component, Input, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, ReadResource } from '@dasch-swiss/dsp-js';
import { FileRepresentation } from '../file-representation';
import { getFileValue } from '../get-file-value';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceUtil } from '../resource.util';

@Component({
  selector: 'app-audio-more-button',
  template: ` <button mat-icon-button [matMenuTriggerFor]="more">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #more="matMenu" class="representation-menu">
      <button mat-menu-item (click)="openIIIFnewTab()">Open audio in new tab</button>
      <button mat-menu-item [cdkCopyToClipboard]="src.fileValue.fileUrl">Copy audio URL to clipboard</button>
      <button mat-menu-item (click)="download()">Download audio</button>
      <button mat-menu-item [disabled]="!userCanEdit" (click)="openReplaceFileDialog()">Replace file</button>
    </mat-menu>`,
})
export class AudioMoreButtonComponent {
  @Input({ required: true }) parentResource!: ReadResource;

  get src() {
    return new FileRepresentation(getFileValue(this.parentResource)!);
  }

  get userCanEdit() {
    return ResourceUtil.userCanEdit(this.parentResource);
  }

  constructor(
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    private _viewContainerRef: ViewContainerRef
  ) {}

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      data: {
        title: 'Audio',
        subtitle: 'Update the audio file of this resource',
        representation: Constants.HasAudioFileValue,
        resource: this.parentResource,
      },
      viewContainerRef: this._viewContainerRef,
    });
  }

  openIIIFnewTab() {
    window.open(this.src.fileValue.fileUrl, '_blank');
  }

  download() {
    this._rs.downloadProjectFile(this.src.fileValue, this.parentResource);
  }
}
