import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProjectRestrictedViewSettings } from '@dasch-swiss/dsp-js';
import { SetRestrictedViewRequest } from '@dasch-swiss/vre/open-api';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
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
import { switchMap, takeWhile } from 'rxjs/operators';
import { ReplaceAnimation } from '../../main/animations/replace-animation';
import { ProjectImageSettings } from './project-image-settings';

@Component({
  selector: 'app-image-settings',
  styleUrls: ['./image-settings.component.scss'],
  templateUrl: './image-settings.component.html',
  animations: [ReplaceAnimation.animation],
})
export class ImageSettingsComponent implements OnInit {
  static AbsoluteWidthSteps: number[] = [64, 128, 256, 512, 1024];

  static GetProjectImageSettings(size: string): ProjectImageSettings {
    /*
                                              !d,d The returned image is scaled so that the width and height of the returned image are not greater than d, while maintaining the aspect ratio.
                                              pct:n The width and height of the returned image is scaled to n percent of the width and height of the extracted region. 1<= n <= 100.
                                            */
    const isPercentage = size.startsWith('pct');
    console.log('size', size);
    if (isPercentage) {
      return {
        restrictImageSize: false,
        isWatermark: true,
        aspect: true,
        absoluteWidth: parseInt(size.substring(1).split(',').pop(), 0),
        percentage: parseInt(size.split('pct:').pop()),
      };
    } else {
      return {
        restrictImageSize: size.split('pct:').pop() === '100',
        isWatermark: true,
        aspect: false,
        absoluteWidth: ImageSettingsComponent.AbsoluteWidthSteps[0],
        percentage: 1,
      };
    }
  }

  static FormatToIiifSize(restrictImageSize: boolean, aspect: boolean, percentage: number, width: number): string {
    if (!restrictImageSize) {
      return 'pct:100';
    }

    return aspect ? `pct:${percentage}` : `!${width},${width}`;
  }

  projectImageSettings: ProjectImageSettings | undefined;
  form: FormGroup;
  projectUuid = this.route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);

  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(ProjectsSelectors.projectRestrictedViewSettings)
  projectRestrictedViewSettings$: Observable<ProjectRestrictedViewSettings>;

  constructor(
    private _projectApiService: ProjectApiService,
    private _projectService: ProjectService,
    private route: ActivatedRoute,
    private _store: Store,
    private _notification: NotificationService,
    private _fb: FormBuilder,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this._store
      .dispatch(new LoadProjectRestrictedViewSettingsAction(this._projectService.uuidToIri(this.projectUuid)))
      .pipe(
        switchMap(() => this.projectRestrictedViewSettings$.pipe(takeWhile(settings => settings?.watermark !== null)))
      )
      .subscribe(settings => {
        this.projectImageSettings = ImageSettingsComponent.GetProjectImageSettings(settings.size);
        this.form = this._fb.group({
          restrictImageSize: this.projectImageSettings.restrictImageSize,
          isWatermark: settings.watermark,
          aspect: this.projectImageSettings.aspect,
          percentage: this.projectImageSettings.percentage,
          absoluteWidthIndex: this.absoluteWidthIndex(this.projectImageSettings.absoluteWidth),
        });
        console.log('GOT FORM!', this.form);
      });
  }

  formatPercentageLabel = (value: number): string => `${value}%`;

  formatAbsoluteLabel = (value: number): string => `${ImageSettingsComponent.AbsoluteWidthSteps[value]}px`;

  absoluteWidthIndex = (value: number): number =>
    ImageSettingsComponent.AbsoluteWidthSteps.findIndex(step => step == value);

  absoluteSliderChange(value: number) {
    this.projectImageSettings.absoluteWidth = ImageSettingsComponent.AbsoluteWidthSteps[value];
  }

  onSubmit() {
    const request: SetRestrictedViewRequest = {
      size: ImageSettingsComponent.FormatToIiifSize(
        this.form.value.restrictImageSize,
        this.form.value.aspect,
        this.form.value.percentage,
        ImageSettingsComponent.AbsoluteWidthSteps[this.form.value.absoluteWidthIndex]
      ),
      watermark: this.form.value.isWatermark,
    };

    this._store.dispatch(new UpdateProjectRestrictedViewSettingsAction(this.projectUuid, request)).subscribe(() => {
      this._notification.openSnackBar(
        this.translateService.instant('appLabels.form.project.imageSettings.updateConfirmation')
      );
    });
  }
}
