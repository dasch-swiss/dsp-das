import { AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewContainerRef } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { Constants, ReadArchiveFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { StatusComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceFetcherService } from '../resource-fetcher.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  standalone: true,
  imports: [StatusComponent, MatIcon, MatIconButton, MatMenuTrigger, MatMenu, MatMenuItem, AsyncPipe],
})
export class ArchiveComponent implements OnChanges {
  @Input({ required: true }) src!: ReadArchiveFileValue;
  @Input({ required: true }) parentResource!: ReadResource;
  originalFilename?: string;

  failedToLoad = false;

  constructor(
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    private _viewContainerRef: ViewContainerRef,
    public resourceFetcherService: ResourceFetcherService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this._rs.getFileInfo(this.src.fileUrl).subscribe(
        res => {
          this.originalFilename = res['originalFilename'];
        },
        () => {
          this.failedToLoad = true;
        }
      );
    }
  }

  download() {
    this._rs.downloadProjectFile(this.src, this.parentResource);
  }

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        title: 'Archive',
        subtitle: 'Update the archive file of this resource',
        representation: Constants.HasArchiveFileValue,
        resource: this.parentResource,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }
}
