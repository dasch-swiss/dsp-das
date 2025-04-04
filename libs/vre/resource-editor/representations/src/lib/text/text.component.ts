import { Component, Input, OnChanges, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, ReadResource } from '@dasch-swiss/dsp-js';
import { FileRepresentation } from '../file-representation';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceUtil } from '../resource.util';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss'],
})
export class TextComponent implements OnChanges {
  @Input({ required: true }) src!: FileRepresentation;
  @Input({ required: true }) parentResource!: ReadResource;

  originalFilename?: string;

  failedToLoad = false;

  get usercanEdit() {
    return ResourceUtil.userCanEdit(this.parentResource);
  }

  constructor(
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnChanges(): void {
    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(
      res => {
        this.originalFilename = res['originalFilename'];
      },
      () => {
        this.failedToLoad = true;
      }
    );
  }

  download() {
    this._rs.downloadProjectFile(this.src.fileValue, this.parentResource);
  }

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      data: {
        title: 'Text (csv, txt, xml)',
        subtitle: 'Update the text file of this resource',
        representation: Constants.HasTextFileValue,
        resource: this.parentResource,
      },
      viewContainerRef: this._viewContainerRef,
    });
  }
}
