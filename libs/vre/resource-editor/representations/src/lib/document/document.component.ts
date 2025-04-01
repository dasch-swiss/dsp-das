import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Constants, ReadDocumentFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { FileRepresentation } from '../file-representation';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceUtil } from '../resource.util';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
})
export class DocumentComponent implements OnChanges {
  @Input({ required: true }) src!: FileRepresentation;
  @Input({ required: true }) parentResource!: ReadResource;

  @ViewChild(PdfViewerComponent) private _pdfComponent!: PdfViewerComponent;

  originalFilename = '';

  zoomFactor = 1.0;

  pdfQuery = '';

  failedToLoad = false;

  get isPdf(): boolean {
    return this.src.fileValue.filename.split('.').pop() === 'pdf';
  }

  get usercanEdit() {
    return ResourceUtil.userCanEdit(this.parentResource);
  }

  constructor(
    private _dialog: MatDialog,
    private _rs: RepresentationService,
    private _cd: ChangeDetectorRef,
    private _viewContainerRef: ViewContainerRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && changes['src'].currentValue) {
      this._setOriginalFilename();
    }
  }

  onInputChange(event: Event) {
    this.searchQueryChanged((event.target as HTMLInputElement).value);
  }

  searchQueryChanged(newQuery: string) {
    const eventName = newQuery !== this.pdfQuery ? 'find' : 'findagain';
    this.pdfQuery = newQuery;
    this._pdfComponent.eventBus.dispatch(eventName, {
      query: this.pdfQuery,
      highlightAll: true,
    });
  }

  download(fileValue: ReadDocumentFileValue) {
    this._rs.downloadProjectFile(fileValue, this.parentResource);
  }

  openReplaceFileDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        title: 'Document',
        subtitle: 'Update the document file of this resource',
        representation: Constants.HasDocumentFileValue,
        resource: this.parentResource,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }

  openFullscreen() {
    const elem = document.getElementsByClassName('pdf-viewer')[0];
    elem?.requestFullscreen?.();
  }

  zoom(mod: -1 | 1) {
    const newZoom = Math.round((this.zoomFactor + mod * 0.2) * 100) / 100;
    this.zoomFactor = newZoom <= 0 ? 0.2 : newZoom;
  }

  private _setOriginalFilename() {
    this.originalFilename = '';
    this._rs.getFileInfo(this.src.fileValue.fileUrl).subscribe(
      res => {
        this.originalFilename = res['originalFilename'] || '';
        this._cd.detectChanges();
      },
      () => {
        // error already handled by getFileInfo
        this.failedToLoad = true;
      }
    );
  }
}
