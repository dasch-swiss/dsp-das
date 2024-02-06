import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProjectRestrictedViewSettings, UpdateProjectRequest } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  LoadProjectRestrictedViewSettingsAction,
  LoadProjectsAction,
  ProjectsSelectors,
  UpdateProjectAction,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, switchMap, take, takeWhile } from 'rxjs/operators';
import { ReplaceAnimation } from '../../main/animations/replace-animation';
import { ProjectImageSettings } from './project-image-settings';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-image-settings',
  styleUrls: ['./image-settings.component.scss'],
  templateUrl: './image-settings.component.html',
  animations: [ReplaceAnimation.animation],
})
export class ImageSettingsComponent implements OnInit {
  readonly absoluteWidthSteps: number[] = [64, 128, 256, 512, 1024];

  formData = new ProjectImageSettings();
  form: FormGroup;
  projectUuid: string;
  project$ = this.route.parent.parent.paramMap.pipe(
    map(params => params.get(RouteConstants.uuidParameter)),
    map(uuid => this._projectService.uuidToIri(uuid)),
    switchMap(iri => this._projectApiService.get(iri)),
    map(project => project.project)
  );
  subscription: Subscription;

  @Output() formValueChange = new EventEmitter<FormGroup>();

  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(ProjectsSelectors.projectRestrictedViewSettings)
  projectRestrictedViewSettings$: Observable<ProjectRestrictedViewSettings>;

  constructor(
    private _projectApiService: ProjectApiService,
    private _projectService: ProjectService,
    private route: ActivatedRoute,
    private _store: Store,
    private _notification: NotificationService,
    private _actions: Actions,
    private _fb: FormBuilder
  ) {}

  ngOnInit() {
    this._buildForm();
    this.setFormData();

    this.subscription = this.form.valueChanges.pipe(startWith(<FormGroup>null)).subscribe(() => {
      this.formValueChange.emit(this.form);
    });
  }

  formatPercentageLabel = (value: number): string => `${value}%`;

  formatAbsoluteLabel = (value: number): string => `${this.absoluteWidthSteps[value]}px`;

  setFormData() {
    this.projectUuid = this.route.parent.parent.snapshot.paramMap.get(RouteConstants.uuidParameter);
    this._store.dispatch(new LoadProjectRestrictedViewSettingsAction(this._projectService.uuidToIri(this.projectUuid)));
    this.projectRestrictedViewSettings$
      .pipe(
        takeWhile(settings => settings?.watermark === true),
        take(1)
      )
      .subscribe(settings => {
        const projectImageSettings = ProjectImageSettings.getProjectImageSettings(settings.size);
        const modifiedData = { ...this.formData } as ProjectImageSettings;
        this.form.patchValue({
          aspect: projectImageSettings.aspect,
          percentage: this.formData.percentage,
          absoluteWidthIndex: this.absoluteWidthSteps[this.formData.absoluteWidth],
        });
      });
  }

  absoluteWidthIndex = (value: number): number => this.absoluteWidthSteps.findIndex(step => step === value);

  absoluteSliderChange = (value: number) => (this.formData.absoluteWidth = this.absoluteWidthSteps[value]);

  onSubmit() {
    const projectData: UpdateProjectRequest = {
      longname: this.form.value.longname,
      description: this.form.value.description,
      keywords: this.form.value.keywords,
    };

    this._store.dispatch(new UpdateProjectAction(this.projectUuid, projectData));
    this._actions.pipe(ofActionSuccessful(LoadProjectsAction), take(1)).subscribe(() => {
      this._notification.openSnackBar('You have successfully updated the project image settings.');
    });
  }

  private _buildForm() {
    this.form = this._fb.group({
      aspect: ['', []],
      absoluteWidthIndex: ['', []],
      percentage: ['', []],
    });
  }
}
