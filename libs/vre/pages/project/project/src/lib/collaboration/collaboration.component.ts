import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ReadUser } from '@dasch-swiss/dsp-js';
import { LoadProjectMembersAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Select, Store } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss'],
})
export class CollaborationComponent implements OnInit {
  project$ = this._store.select(ProjectsSelectors.currentProject);
  projectMembers$ = this._store.select(ProjectsSelectors.projectMembers);
  isAdmin$ = this._store.select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin);

  projectUuid$ = this.project$.pipe(
    tap(p => {
      this._titleService.setTitle(`Project ${p?.shortname} | Collaboration`);
    }),
    map(p => {
      return ProjectService.IriToUuid(p?.id || '');
    }),
    filter(uuid => !!uuid),
    first()
  );

  get activeProjectMembers$(): Observable<ReadUser[]> {
    return combineLatest([this.project$, this.projectMembers$]).pipe(
      map(([currentProject, projectMembers]) => {
        if (!currentProject || !projectMembers[currentProject.id]) {
          return [];
        }
        return projectMembers[currentProject.id]?.value.filter(member => member?.status === true) || [];
      })
    );
  }

  get inactiveProjectMembers$(): Observable<ReadUser[]> {
    return combineLatest([this.project$, this.projectMembers$]).pipe(
      map(([currentProject, projectMembers]) => {
        if (!currentProject || !projectMembers[currentProject.id]) {
          return [];
        }
        return projectMembers[currentProject?.id].value.filter(member => member?.status === false) || [];
      })
    );
  }

  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$!: Observable<boolean>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin$!: Observable<boolean>;
  @Select(UserSelectors.isSysAdmin) isSysAdmin$!: Observable<boolean>;
  @Select(UserSelectors.user) user$!: Observable<ReadUser>;

  constructor(
    protected _route: ActivatedRoute,
    protected _projectService: ProjectService,
    protected _titleService: Title,
    protected _store: Store,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions,
    protected _router: Router
  ) {}

  ngOnInit() {
    this.projectUuid$.subscribe(projectUuid => {
      if (projectUuid) {
        this._store.dispatch(new LoadProjectMembersAction(projectUuid));
      }
    });
  }
}
