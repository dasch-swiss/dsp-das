import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReadStillImageFileValue } from '@dasch-swiss/dsp-js';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { RepresentationService } from '@dsp-app/src/app/workspace/resource/representation/representation.service';
import { RegionService } from '@dsp-app/src/app/workspace/resource/representation/still-image_/region.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-still-image-action-panel',
  templateUrl: './still-image-action-panel.component.html',
  styleUrls: ['./still-image-action-panel.component.scss'],
})
export class StillImageActionPanelComponent {
  @Input() editorPermissions = false;

  @Input() fileValue: ReadStillImageFileValue;

  @Output() replaceFile = new EventEmitter<void>();

  isDrawing$: Observable<boolean>;

  constructor(
    private _notification: NotificationService,
    private _regionService: RegionService,
    private _rs: RepresentationService
  ) {
    this.isDrawing$ = this._regionService.isDrawing$;
  }

  openImageInNewTab(url: string) {
    window.open(url, '_blank');
  }

  openSnackBar(message: string) {
    this._notification.openSnackBar(message);
  }

  download(url: string) {
    this._rs.downloadFile(url, this.fileValue.filename);
  }

  drawRegion() {
    this._regionService.draw();
  }
}
