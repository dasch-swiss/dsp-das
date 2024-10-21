import { Component, Inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Constants,
  KnoraApiConnection,
  ReadResource,
  ReadStillImageExternalFileValue,
  ReadStillImageFileValue,
  UpdateFileValue,
  UpdateResource,
} from '@dasch-swiss/dsp-js';
import { ResourceUtil } from '@dasch-swiss/vre/shared/app-common';
import { DspApiConnectionToken, DspDialogConfig } from '@dasch-swiss/vre/shared/app-config';
import { AppError } from '@dasch-swiss/vre/shared/app-error-handler';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import * as OpenSeadragon from 'openseadragon';
import { take } from 'rxjs/operators';
import { EditThirdPartyIiifFormComponent } from '../edit-third-party-iiif-form/edit-third-party-iiif-form.component';
import { ThirdPartyIiifProps } from '../edit-third-party-iiif-form/edit-third-party-iiif-types';
import {
  ReplaceFileDialogComponent,
  ReplaceFileDialogProps,
} from '../replace-file-dialog/replace-file-dialog.component';
import { RepresentationService } from '../representation.service';
import { ResourceFetcherService } from '../resource-fetcher.service';
import { OsdDrawerService } from './osd-drawer.service';

@Component({
  selector: 'app-still-image-toolbar',
  template: ` <div style="display: flex; justify-content: space-between">
      <span>
        <button
          mat-icon-button
          data-cy="more-vert-image-button"
          [matMenuTriggerFor]="more"
          matTooltip="More"
          matTooltipPosition="above">
          <mat-icon>more_vert</mat-icon>
        </button>

        <button
          data-cy="still-image-share-button"
          mat-icon-button
          [matMenuTriggerFor]="share"
          [disabled]="isReadStillImageExternalFileValue"
          matTooltip="Share"
          matTooltipPosition="above">
          <mat-icon>share</mat-icon>
        </button>

        <button
          data-cy="still-image-download-button"
          mat-icon-button
          matTooltip="Download"
          [disabled]="isReadStillImageExternalFileValue || !userCanView"
          (click)="download()">
          <mat-icon>download</mat-icon>
        </button>
        <button
          data-cy="still-image-region-button"
          mat-icon-button
          id="DSP_OSD_DRAW_REGION"
          matTooltip="Draw Region"
          [disabled]="!userCanEdit || isReadStillImageExternalFileValue"
          (click)="drawButtonClicked()"
          [class.active]="osd.viewer.isMouseNavEnabled()">
          <mat-icon svgIcon="draw_region_icon"></mat-icon>
        </button>
      </span>

      <ng-content select="[navigation]"></ng-content>

      <span>
        <button
          data-cy="still-image-settings-button"
          mat-icon-button
          id="DSP_OSD_SETTINGS"
          matTooltip="Settings"
          [matMenuTriggerFor]="settings"
          [disabled]="this.isReadStillImageExternalFileValue">
          <mat-icon>settings</mat-icon>
        </button>
        <button mat-icon-button id="DSP_OSD_ZOOM_OUT" data-cy="zoom-out" matTooltip="Zoom out">
          <mat-icon>zoom_out</mat-icon>
        </button>
        <button mat-icon-button id="DSP_OSD_ZOOM_IN" data-cy="zoom-in" matTooltip="Zoom in">
          <mat-icon>zoom_in</mat-icon>
        </button>
        <button mat-icon-button id="DSP_OSD_HOME" data-ci="zoom-reset" matTooltip="Reset zoom">
          <mat-icon>other_houses</mat-icon>
        </button>
        <button mat-icon-button id="DSP_OSD_FULL_PAGE" data-ci="fullscreen" matTooltip="Open in fullscreen">
          <mat-icon>fullscreen</mat-icon>
        </button>
      </span>
    </div>

    <mat-menu #more="matMenu" class="representation-menu">
      <button class="menu-content" mat-menu-item (click)="openImageInNewTab(imageFileValue.fileUrl)">
        Open IIIF URL in new tab
      </button>
      <button
        class="menu-content"
        data-cy="replace-image-button"
        mat-menu-item
        [disabled]="!userCanEdit"
        (click)="replaceImage()">
        {{ isReadStillImageExternalFileValue ? 'Replace external file url' : 'Replace file' }}
      </button>
    </mat-menu>

    <mat-menu #share="matMenu" class="res-share-menu">
      <button
        mat-menu-item
        (click)="notification.openSnackBar('IIIF URL copied to clipboard!')"
        [cdkCopyToClipboard]="imageFileValue.fileUrl">
        <mat-icon>content_copy</mat-icon>
        Copy IIIF URL to clipboard
      </button>
      <button
        mat-menu-item
        [cdkCopyToClipboard]="imageFileValue.arkUrl"
        (click)="notification.openSnackBar('ARK URL copied to clipboard!')">
        <mat-icon>content_copy</mat-icon>
        Copy ARK url to clipboard
      </button>
    </mat-menu>
    <mat-menu #settings="matMenu" class="settings-menu">
      <button class="menu-content" mat-menu-item (click)="imageFormatIsPng.next(false)">
        <mat-icon *ngIf="!isPng">check</mat-icon>
        JPG
      </button>
      <button mat-menu-item (click)="imageFormatIsPng.next(true)">
        <mat-icon *ngIf="isPng">check</mat-icon>
        PNG
      </button>
    </mat-menu>`,
})
export class StillImageToolbarComponent {
  @Input({ required: true }) resource!: ReadResource;
  @Input({ required: true }) isPng!: boolean;
  @Input({ required: true }) viewer!: OpenSeadragon.Viewer;

  imageFormatIsPng = this._resourceFetcherService.settings.imageFormatIsPng;

  get imageFileValue() {
    const image = this.resource.properties[Constants.HasStillImageFileValue][0];
    switch (image.type) {
      case Constants.StillImageFileValue:
        return image as ReadStillImageFileValue;
      case Constants.StillImageExternalFileValue:
        return image as ReadStillImageExternalFileValue;
      default:
        throw new AppError('Unknown image type');
    }
  }

  get isReadStillImageExternalFileValue(): boolean {
    return !!this.imageFileValue && this.imageFileValue.type === Constants.StillImageExternalFileValue;
  }

  get userCanView() {
    return this.imageFileValue && ResourceUtil.userCanView(this.imageFileValue);
  }

  get userCanEdit() {
    return ResourceUtil.userCanEdit(this.resource);
  }

  constructor(
    public notification: NotificationService,
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _store: Store,
    private _resourceFetcherService: ResourceFetcherService,
    private _rs: RepresentationService,
    private _dialog: MatDialog,
    private _domSanitizer: DomSanitizer,
    private _matIconRegistry: MatIconRegistry,
    public osd: OsdDrawerService
  ) {
    this._setupCssMaterialIcon();
  }

  openImageInNewTab(url: string) {
    window.open(url, '_blank');
  }

  drawButtonClicked(): void {
    console.log('drawButtonClicked');
    this.viewer.setMouseNavEnabled(!this.viewer.isMouseNavEnabled());
  }

  download() {
    const projectShort = this._store.selectSnapshot(ProjectsSelectors.currentProject)!.shortcode;
    const assetId = this.imageFileValue.filename.split('.')[0] || '';

    if (!projectShort) {
      throw new AppError('Error with project shortcode');
    }
    this._rs
      .getIngestFileInfo(projectShort, assetId)
      .pipe(take(1))
      .subscribe(response => {
        this._rs.downloadFile(this.imageFileValue.fileUrl, response.originalFilename);
      });
  }

  replaceImage() {
    let dialogRef;
    if (this.isReadStillImageExternalFileValue) {
      dialogRef = this._dialog.open<EditThirdPartyIiifFormComponent, ThirdPartyIiifProps>(
        EditThirdPartyIiifFormComponent,
        DspDialogConfig.dialogDrawerConfig({
          resourceId: this.resource.id,
          fileValue: this.imageFileValue as ReadStillImageExternalFileValue,
        })
      );
    } else {
      dialogRef = this._dialog.open<ReplaceFileDialogComponent, ReplaceFileDialogProps>(ReplaceFileDialogComponent, {
        data: {
          projectUuid: ProjectService.IriToUuid(this.resource.attachedToProject),
          title: 'Image',
          subtitle: 'Update image of the resource',
          representation: Constants.HasStillImageFileValue,
          propId: this.resource.properties[Constants.HasStillImageFileValue][0].id,
        },
      });
    }

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this._replaceFile(data);
      }
    });
  }

  private _replaceFile(file: UpdateFileValue) {
    const updateRes = new UpdateResource();
    updateRes.id = this.resource.id;
    updateRes.type = this.resource.type;
    updateRes.property = Constants.HasStillImageFileValue;
    updateRes.value = file;
    this._dspApiConnection.v2.values.updateValue(updateRes as UpdateResource<UpdateFileValue>).subscribe(() => {
      this._resourceFetcherService.reload();
    });
  }

  private _setupCssMaterialIcon() {
    this._matIconRegistry.addSvgIcon(
      'draw_region_icon',
      this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/draw-region-icon.svg')
    );
  }
}
