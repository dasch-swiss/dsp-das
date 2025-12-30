import { AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewContainerRef } from '@angular/core';
import { Constants, ReadArchiveFileValue, ReadResource } from '@dasch-swiss/dsp-js';
import { CenteredMessageComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { DownloadMenuItemComponent } from '../download-menu-item.component';
import { ReplaceFileMenuItemComponent } from '../replace-file-menu-item.component';
import { RepresentationErrorMessageComponent } from '../representation-error-message.component';
import { RepresentationService } from '../representation.service';
import { ResourceFetcherService } from '../resource-fetcher.service';

@Component({
  selector: 'app-archive',
  imports: [
    AsyncPipe,
    TranslatePipe,
    DownloadMenuItemComponent,
    ReplaceFileMenuItemComponent,
    RepresentationErrorMessageComponent,
    CenteredMessageComponent,
  ],
  template: `
    @if (failedToLoad) {
      <app-representation-error-message />
    } @else {
      <div style="padding-top: 20px">
        <app-centered-message [icon]="'description'" [message]="originalFilename" [color]="'white'" />

        <div style="display: flex; justify-content: center; gap: 16px">
          <app-download-menu-item [src]="src" [parentResource]="parentResource" />

          @if (resourceFetcherService.userCanEdit$ | async) {
            <app-replace-file-menu-item
              [title]="'resourceEditor.representations.archive.title' | translate"
              [subtitle]="'resourceEditor.representations.archive.updateFile' | translate"
              [representation]="representation"
              [parentResource]="parentResource"
              [viewContainerRef]="viewContainerRef" />
          }
        </div>
      </div>
    }
  `,
})
export class ArchiveComponent implements OnChanges {
  @Input({ required: true }) src!: ReadArchiveFileValue;
  @Input({ required: true }) parentResource!: ReadResource;
  originalFilename?: string;

  readonly representation = Constants.HasArchiveFileValue;
  failedToLoad = false;

  constructor(
    private readonly _rs: RepresentationService,
    public readonly viewContainerRef: ViewContainerRef,
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
}
