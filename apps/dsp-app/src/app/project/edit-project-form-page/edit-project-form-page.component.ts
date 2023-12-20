import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StringLiteral, UpdateProjectRequest } from '@dasch-swiss/dsp-js';
import { ProjectApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import { UpdateProjectAction } from '@dasch-swiss/vre/shared/app-state';
import { Store } from '@ngxs/store';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-edit-project-form-page',
  templateUrl: './edit-project-form-page.component.html',
})
export class EditProjectFormPageComponent {
  form: FormGroup;
  loading = false;
  project$ = this.route.parent.paramMap.pipe(
    map(params => params.get(RouteConstants.uuidParameter)),
    map(uuid => this._projectService.uuidToIri(uuid)),
    switchMap(iri => this._projectApiService.get(iri)),
    map(project => project.project)
  );

  constructor(
    private _projectApiService: ProjectApiService,
    private _projectService: ProjectService,
    private route: ActivatedRoute,
    private _store: Store,
    private _router: Router,
    private _notification: NotificationService
  ) {}

  onSubmit() {
    const projectUuid = this.route.snapshot.paramMap.get(RouteConstants.uuidParameter);

    const projectData: UpdateProjectRequest = {
      description: [new StringLiteral()],
      keywords: this.form.value.keywords,
      longname: this.form.value.longname,
      shortname: this.form.value.shortname,
      status: true,
    };

    this._store.dispatch(new UpdateProjectAction(projectUuid, projectData)).subscribe(v => {
      this._notification.openSnackBar('You have successfully updated the project information.');
      this._router.navigate([`${RouteConstants.projectRelative}/${projectUuid}`]);
    });
  }
}
