import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectRestrictedViewSettings } from '@dasch-swiss/dsp-js';
import { RestrictedViewResponse } from '@dasch-swiss/vre/3rd-party-services/open-api';
import { RouteConstants } from '@dasch-swiss/vre/core/config';
import {
  LoadProjectRestrictedViewSettingsAction,
  ProjectsSelectors,
  UpdateProjectRestrictedViewSettingsAction,
} from '@dasch-swiss/vre/core/state';
import { ReplaceAnimation } from '@dasch-swiss/vre/shared/app-common';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/ui/notification';
import { TranslateService } from '@ngx-translate/core';
import { Select, Store } from '@ngxs/store';
import { IMask } from 'angular-imask';
import { Observable, switchMap, take, takeWhile } from 'rxjs';

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
  readonly imageSettingsEnum = ImageSettingsEnum;

  currentSettings: ProjectRestrictedViewSettings | RestrictedViewResponse;
  imageSettings: ImageSettingsEnum = ImageSettingsEnum.Off;
  projectUuid = this.route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);
  percentage = '99';
  fixedWidth: string;

  minMaxInputMask(min: number, max: number) {
    return {
      mask: IMask.MaskedNumber,
      min,
      max,
      autofix: true,
    };
  }

  get hasChanges(): boolean {
    return JSON.stringify(this.currentSettings) !== JSON.stringify(this.getRequest());
  }

  get ratio(): number {
    if (!this.percentage) {
      return 0;
    }

    return parseInt(this.percentage, 0) / 100;
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
    this._store
      .dispatch(new UpdateProjectRestrictedViewSettingsAction(this.projectUuid, this.getRequest()))
      .subscribe(() => {
        this.currentSettings = this._store.selectSnapshot(ProjectsSelectors.projectRestrictedViewSettings);
        this._notification.openSnackBar(
          this.translateService.instant('pages.project.imageSettings.updateConfirmation')
        );
      });
  }

  onPercentageInputChange() {
    this.fixedWidth = null;
  }

  onFixedWidthInputChange() {
    this.percentage = null;
  }

  private getRequest(): any {
    return this.imageSettings === ImageSettingsEnum.Watermark
      ? { watermark: true }
      : { size: this.getSizeForRequest() };
  }

  private getImageSettings() {
    this._store
      .dispatch(new LoadProjectRestrictedViewSettingsAction(this._projectService.uuidToIri(this.projectUuid)))
      .pipe(
        switchMap(() =>
          this.viewSettings$.pipe(
            take(1),
            takeWhile(settings => settings !== null)
          )
        )
      )
      .subscribe(settings => {
        if (settings && !settings.watermark && settings.size) {
          delete settings.watermark;
        } else if (!settings || !settings.watermark) {
          return;
        }

        this.currentSettings = settings;
        if ((settings.watermark === false && !settings.size) || (settings.size && settings.size === 'pct:100')) {
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
