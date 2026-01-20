import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, ViewContainerRef } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { Constants, ReadDocumentFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { DspDialogConfig } from '@dasch-swiss/vre/core/config';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { ResourceFetcherService } from '../resource-fetcher.service';

@Component({
  selector: 'app-pdf-toolbar',
  imports: [
    AsyncPipe,
    MatIconButton,
    MatFormField,
    MatIcon,
    MatInput,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatTooltip,
    TranslatePipe,
  ],
  template: `
    <div style="display: flex; align-items: center; justify-content: space-between">
      <span>
        <button mat-icon-button [matMenuTriggerFor]="more">
          <mat-icon>more_vert</mat-icon>
        </button>

        <button
          mat-icon-button
          id="DSP_PDF_ZOOM_OUT"
          [matTooltip]="'resourceEditor.representations.document.zoomOut' | translate"
          (click)="handleZoom(-1)">
          <mat-icon>zoom_out</mat-icon>
        </button>

        <button
          mat-icon-button
          id="DSP_PDF_ZOOM_IN"
          [matTooltip]="'resourceEditor.representations.document.zoomIn' | translate"
          (click)="handleZoom(1)">
          <mat-icon>zoom_in</mat-icon>
        </button>

        <button
          mat-icon-button
          id="DSP_PDF_HOME"
          [matTooltip]="'resourceEditor.representations.document.resetZoom' | translate"
          (click)="zoomChange.emit(1.0)">
          <mat-icon>adjust</mat-icon>
        </button>
      </span>

      <!-- Search input -->
      <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width: 400px; background: white">
        <input
          matInput
          #queryInp
          type="text"
          id="searchbox"
          name="searchbox"
          [placeholder]="'resourceEditor.representations.document.searchPlaceholder' | translate"
          (input)="onSearchInput($event)"
          (keyup.enter)="searchQuery.emit(queryInp.value)" />
      </mat-form-field>

      <span>
        <button
          mat-icon-button
          id="DSP_PDF_FULL_SCREEN"
          [matTooltip]="'resourceEditor.representations.document.fullscreen' | translate"
          (click)="fullscreenToggle.emit()">
          <mat-icon>fullscreen</mat-icon>
        </button>
      </span>
    </div>

    <mat-menu #more="matMenu">
      <button mat-menu-item (click)="downloadFile.emit()">
        {{ 'resourceEditor.representations.downloadFile' | translate }}
      </button>
      @if (resourceFetcherService.userCanEdit$ | async) {
        <button mat-menu-item (click)="openReplaceDialog()">
          {{ 'resourceEditor.representations.replaceFile' | translate }}
        </button>
      }
    </mat-menu>
  `,
})
export class PdfToolbarComponent {
  @Input({ required: true }) zoomFactor!: number;
  @Input({ required: true }) parentResource!: ReadResource;
  @Input({ required: true }) src!: ReadDocumentFileValue;

  @Output() zoomChange = new EventEmitter<number>();
  @Output() searchQuery = new EventEmitter<string>();
  @Output() fullscreenToggle = new EventEmitter<void>();
  @Output() downloadFile = new EventEmitter<void>();

  private readonly _translateService = inject(TranslateService);

  constructor(
    private readonly _dialog: MatDialog,
    private readonly _viewContainerRef: ViewContainerRef,
    public readonly resourceFetcherService: ResourceFetcherService
  ) {}

  onSearchInput(event: Event) {
    this.searchQuery.emit((event.target as HTMLInputElement).value);
  }

  handleZoom(mod: -1 | 1) {
    const newZoom = Math.round((this.zoomFactor + mod * 0.2) * 100) / 100;
    this.zoomChange.emit(newZoom <= 0 ? 0.2 : newZoom);
  }

  openReplaceDialog() {
    this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
      ...DspDialogConfig.mediumDialog({
        title: this._translateService.instant('resourceEditor.representations.document.title'),
        subtitle: this._translateService.instant('resourceEditor.representations.document.updateFile'),
        representation: Constants.HasDocumentFileValue,
        resource: this.parentResource,
      }),
      viewContainerRef: this._viewContainerRef,
    });
  }
}
