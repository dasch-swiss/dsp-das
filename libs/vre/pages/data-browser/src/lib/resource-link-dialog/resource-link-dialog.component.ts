import { ChangeDetectionStrategy, Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  Constants,
  CreateLinkValue,
  CreateResource,
  CreateTextValueAsString,
  KnoraApiConnection,
  StoredProject,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/core/config';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { FilteredResources, ShortResInfo } from '@dasch-swiss/vre/shared/app-common-to-move';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Store } from '@ngxs/store';
import { combineLatest, map, Observable, Subject, takeUntil } from 'rxjs';

export interface ResourceLinkDialogProps {
  resources: FilteredResources;
  projectUuid: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-resource-link-dialog',
  templateUrl: './resource-link-dialog.component.html',
  styleUrls: ['./resource-link-dialog.component.scss'],
})
export class ResourceLinkDialogComponent implements OnDestroy {
  private _ngUnsubscribe = new Subject<void>();

  readonly title = `Create a collection of ${this.data.resources.count} resources`;
  form = this._fb.group({
    label: ['', [Validators.required]],
    comment: [''],
  });

  selectedProject?: string;

  usersProjects$: Observable<StoredProject[]> = combineLatest([
    this._store.select(ProjectsSelectors.currentProject),
    this._store.select(UserSelectors.userProjects),
    this._store.select(UserSelectors.isSysAdmin),
  ]).pipe(
    takeUntil(this._ngUnsubscribe),
    map(([currentProject, currentUserProjects, isSysAdmin]) => {
      const projects = currentProject
        ? isSysAdmin
          ? [currentProject]
          : [currentUserProjects.find(x => x.id === currentProject.id)]
        : currentUserProjects;
      return projects as StoredProject[];
    })
  );

  isSysAdmin$ = this._store.select(UserSelectors.isSysAdmin);
  isCurrentProjectAdminOrSysAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);
  isCurrentProjectMember$ = this._store.select(ProjectsSelectors.isCurrentProjectMember);
  isLoading$ = this._store.select(ProjectsSelectors.isProjectsLoading);

  get isProjectMember(): boolean {
    const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectGroups);
    const user = this._store.selectSnapshot(UserSelectors.user)!;
    const isProjectMember = ProjectService.IsProjectMemberOrAdminOrSysAdmin(
      user,
      userProjectGroups,
      this.data.projectUuid!
    );
    return isProjectMember;
  }

  constructor(
    @Inject(DspApiConnectionToken)
    private _dspApiConnection: KnoraApiConnection,
    private _fb: FormBuilder,
    private _resourceService: ResourceService,
    private _router: Router,
    private _store: Store,
    public dialogRef: MatDialogRef<ResourceLinkDialogComponent, void>,
    @Inject(MAT_DIALOG_DATA) public data: ResourceLinkDialogProps
  ) {}

  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  trackByFn = (index: number, item: ShortResInfo) => `${index}-${item.id}`;

  submitData() {
    const linkObj = this._createPayload();

    this._dspApiConnection.v2.res.createResource(linkObj).subscribe(res => {
      const path = this._resourceService.getResourcePath(res.id);
      const goto = `/resource${path}`;
      this._router.navigate([]).then(() => window.open(goto, '_blank'));
      this.dialogRef.close();
    });
  }

  private _createPayload() {
    const linkObj = new CreateResource();

    linkObj.label = this.form.controls.label.value!;
    linkObj.type = Constants.LinkObj;
    linkObj.attachedToProject = this.data.projectUuid;

    linkObj.properties[Constants.HasLinkToValue] = this.data.resources.resInfo.map(res => {
      const linkVal = new CreateLinkValue();
      linkVal.type = Constants.LinkValue;
      linkVal.linkedResourceIri = res.id;
      return linkVal;
    });

    const comment = this.form.controls.comment.value;

    if (comment) {
      const commentVal = new CreateTextValueAsString();
      commentVal.type = Constants.TextValue;
      commentVal.text = comment;
      linkObj.properties[Constants.HasComment] = [commentVal];
    }

    return linkObj;
  }
}
