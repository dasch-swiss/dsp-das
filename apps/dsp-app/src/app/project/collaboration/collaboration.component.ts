import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import {
  IKeyValuePairs,
  LoadProjectMembersAction,
  ProjectsSelectors,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { ProjectBase } from '../project-base';
import { AddUserComponent } from './add-user/add-user.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collaboration',
  template: `
    <dasch-swiss-app-progress-indicator *ngIf="isProjectsLoading$ | async"></dasch-swiss-app-progress-indicator>

    <div *ngIf="(isProjectsLoading$ | async) === false">
      <div *ngIf="isCurrentProjectAdminOrSysAdmin$ | async" class="content large middle">
        <!-- add user to the project -->
        <app-add-user
          *ngIf="(project$ | async)?.status && (isCurrentProjectAdminOrSysAdmin$ | async) === true"
          [projectUuid]="projectUuid"
          (refreshParent)="refresh()"
          #addUserComponent></app-add-user>

        <!-- main content: list of project members -->

        <div class="users-list">
          <!-- list of active users -->
          <app-users-list
            [project]="project$ | async"
            [list]="activeProjectMembers$ | async"
            [status]="true"
            (refreshParent)="refresh()"></app-users-list>

          <!-- list of inactive users -->
          <app-users-list
            [project]="project$ | async"
            [list]="inactiveProjectMembers$ | async"
            [status]="false"
            (refreshParent)="refresh()"></app-users-list>
        </div>
      </div>

      <div *ngIf="(isCurrentProjectAdminOrSysAdmin$ | async) === false" class="content large middle">
        <app-status [status]="403"></app-status>
      </div>
    </div>
  `,
  styles: [
    `
      @use '../../../styles/responsive' as *;

      // mobile device: tablet and smaller than a tablet
      @media (max-width: map-get($grid-breakpoints, tablet)) {
        .users-list {
          margin: 0 16px 0 16px;
        }
      }
    `,
  ],
})
export class CollaborationComponent extends ProjectBase implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  @ViewChild('addUserComponent') addUser: AddUserComponent;

  get activeProjectMembers$(): Observable<ReadUser[]> {
    return this.projectMembers$.pipe(
      takeUntil(this.ngUnsubscribe),
      map(projectMembers => {
        if (!projectMembers[this.projectIri]) {
          return [];
        }

        return projectMembers[this.projectIri].value.filter(member => member.status === true);
      })
    );
  }

  get inactiveProjectMembers$(): Observable<ReadUser[]> {
    return this.projectMembers$.pipe(
      takeUntil(this.ngUnsubscribe),
      map(projectMembers => {
        if (!projectMembers[this.projectIri]) {
          return [];
        }

        return projectMembers[this.projectIri].value.filter(member => !member.status);
      })
    );
  }

  @Select(ProjectsSelectors.projectMembers) projectMembers$: Observable<IKeyValuePairs<ReadUser>>;
  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
  @Select(UserSelectors.user) user$: Observable<ReadUser>;
  @Select(ProjectsSelectors.currentProject) project$: Observable<ReadProject>;

  constructor(
    protected _route: ActivatedRoute,
    protected _projectService: ProjectService,
    protected _titleService: Title,
    protected _store: Store,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions,
    protected _router: Router
  ) {
    super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
    // get the uuid of the current project
    if (this._route.parent.parent.snapshot.url.length) {
      this._route.parent.parent.paramMap.subscribe((params: Params) => {
        this.projectUuid = params.get('uuid');
      });
    }
  }

  ngOnInit() {
    super.ngOnInit();
    const project = this._store.selectSnapshot(ProjectsSelectors.currentProject) as ReadProject;
    this._titleService.setTitle(`Project ${project?.shortname} | Collaboration`);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refresh(): void {
    this._store.dispatch(new LoadProjectMembersAction(this.projectUuid));

    // refresh child component: add user
    if (this.addUser) {
      this.addUser.buildForm();
    }
  }
}
