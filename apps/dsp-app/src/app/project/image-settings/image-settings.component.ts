import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectRestrictedViewSettings } from '@dasch-swiss/dsp-js';
import { SetRestrictedViewRequest } from '@dasch-swiss/vre/open-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  LoadProjectRestrictedViewSettingsAction,
  ProjectsSelectors,
  UpdateProjectRestrictedViewSettingsAction,
} from '@dasch-swiss/vre/shared/app-state';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap, take, takeWhile } from 'rxjs/operators';
import { ReplaceAnimation } from '../../main/animations/replace-animation';
import { InputMasks } from '../../main/directive/input-masks';

enum ImageSettingsEnum {
  Off = 'Off',
  Watermark = 'Watermark',
  RestrictImageSize = 'RestrictImageSize',
}

@Component({
  selector: 'app-image-settings',
  styleUrls: ['./image-settings.component.scss'],
  templateUrl: './image-settings.component.html',
  animations: [ReplaceAnimation.animation],
})
export class ImageSettingsComponent implements OnInit {
  readonly minWidth = 128;
  readonly maxWidth = 1024;
  readonly inputMasks = InputMasks;
  readonly imageSettingsEnum = ImageSettingsEnum;

  imageSettings: ImageSettingsEnum = ImageSettingsEnum.Off;
  projectUuid = this.route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);
  percentage: string = '99';

  fixedWidthNumber: number;

  get ratio(): number {
    if (!this.percentage) {
      return 0;
    }

    return parseInt(this.percentage, 0) / 100;
  }

  get fixedWidth(): string {
    return this.fixedWidthNumber ? this.fixedWidthNumber.toString() : '';
  }

  set fixedWidth(value: string) {
    if (!value) {
      this.fixedWidthNumber = null;
      return;
    }

    const width = parseInt(value, 0);
    if (width < this.minWidth || width > this.maxWidth) {
      return;
    }

    this.fixedWidthNumber = width;
  }

  get isPercentageSize(): boolean {
    return this.percentage !== null;
  }

  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(ProjectsSelectors.projectRestrictedViewSettings) viewSettings$: Observable<ProjectRestrictedViewSettings>;

  constructor(
    private _projectService: ProjectService,
    private route: ActivatedRoute,
    private _store: Store,
    private _notification: NotificationService,
    private translateService: TranslateService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getImageSettings();
  }

  onSubmit() {
    const request: SetRestrictedViewRequest = {
      size: this.getSizeForRequest(),
      watermark: this.imageSettings === ImageSettingsEnum.Watermark,
    };

    this._store.dispatch(new UpdateProjectRestrictedViewSettingsAction(this.projectUuid, request)).subscribe(() => {
      this._notification.openSnackBar(
        this.translateService.instant('appLabels.form.project.imageSettings.updateConfirmation')
      );
    });
  }

  onPercentageInputChange() {
    this.fixedWidth = null;
  }

  onFixedWidthInputChange() {
    this.percentage = null;
  }

  private getImageSettings() {
    this._store
      .dispatch(new LoadProjectRestrictedViewSettingsAction(this._projectService.uuidToIri(this.projectUuid)))
      .pipe(
        switchMap(() =>
          this.viewSettings$.pipe(
            take(1),
            takeWhile(settings => settings?.watermark !== null)
          )
        )
      )
      .subscribe(settings => {
        if (settings.size === 'pct:100') {
          this.imageSettings = this.imageSettingsEnum.Off;
          return;
        }

        if (settings.watermark) {
          this.imageSettings = ImageSettingsEnum.Watermark;
        } else {
          this.setRestrictedSize(settings.size);
        }

        this._cd.detectChanges();
      });
  }

  private setRestrictedSize(size: string) {
    if (size) {
      this.imageSettings = ImageSettingsEnum.RestrictImageSize;
    }

    if (size.startsWith('pct')) {
      this.percentage = size.split(':')[1];
      this.fixedWidth = null;
    } else {
      this.fixedWidth = size.split(',')[1];
      this.percentage = null;
    }
  }

  private getSizeForRequest() {
    if (this.imageSettings === ImageSettingsEnum.RestrictImageSize) {
      return this.isPercentageSize ? `pct:${this.percentage}` : `!${this.fixedWidth},${this.fixedWidth}`;
    } else {
      return 'pct:100';
    }
  }
}
