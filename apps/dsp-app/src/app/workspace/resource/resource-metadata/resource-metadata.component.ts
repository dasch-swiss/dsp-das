import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ReadProject, ReadUser, StoredProject } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  GetAttachedProjectAction,
  GetAttachedUserAction,
  ProjectsSelectors,
  ResourceSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { DspResource } from '@dsp-app/src/app/workspace/resource/dsp-resource';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-resource-metadata',
  templateUrl: './resource-metadata.component.html',
  styleUrls: ['./resource-metadata.component.scss'],
})
export class ResourceMetadataComponent implements OnInit, OnDestroy {
  @Input() resource: DspResource;
  @Input() displayProjectInfo = false;

  private ngUnsubscribe: Subject<void> = new Subject<void>();

  project: ReadProject | StoredProject;
  user: ReadUser;

  constructor(
    private _actions$: Actions,
    private _store: Store
  ) {}

  ngOnInit() {
    this._store.dispatch([
      new GetAttachedUserAction(this.resource.id, this.resource.attachedToUser),
      new GetAttachedProjectAction(this.resource.id, this.resource.attachedToProject),
    ]);

    this.project = this._store
      .selectSnapshot(ProjectsSelectors.allProjects)
      .find(p => p.id === this.resource.attachedToProject);
    this._actions$
      .pipe(ofActionSuccessful(GetAttachedProjectAction))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        const attachedProjects = this._store.selectSnapshot(ResourceSelectors.attachedProjects);
        this.project = attachedProjects[this.resource.id].value.find(u => u.id === this.resource.attachedToProject);
      });

    this._actions$
      .pipe(ofActionSuccessful(GetAttachedUserAction))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        const attachedUsers = this._store.selectSnapshot(ResourceSelectors.attachedUsers);
        this.user = attachedUsers[this.resource.id].value.find(u => u.id === this.resource.attachedToUser);
      });
  }

  openProject(project: ReadProject | StoredProject) {
    const uuid = ProjectService.IriToUuid(project.id);
    window.open(`/project/${uuid}`, '_blank');
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
