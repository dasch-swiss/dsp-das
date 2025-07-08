import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import {
  IKeyValuePairs,
  LoadProjectMembershipAction,
  LoadProjectOntologiesAction,
  LoadProjectsAction,
  OntologiesSelectors,
  ProjectsSelectors,
  UserSelectors,
} from '@dasch-swiss/vre/core/state';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { filter, map, take, takeUntil, takeWhile } from 'rxjs';

@Injectable()
export class ProjectBaseService {
  destroyed: Subject<void> = new Subject<void>();

  projectUuid: string;
  project?: ReadProject;

  // permissions of logged-in user
  isAdmin$: Observable<boolean> = combineLatest([
    this._store.select(UserSelectors.user).pipe(filter(user => user !== null)) as Observable<ReadUser>,
    this._store.select(UserSelectors.userProjectAdminGroups),
    this._route.params,
    this._route.parent.params,
  ]).pipe(
    takeUntil(this.destroyed),
    map(([user, userProjectGroups, params, parentParams]) => {
      const projectIri = this._projectService.uuidToIri(params.uuid ? params.uuid : parentParams.uuid);
      return ProjectService.IsProjectAdminOrSysAdmin(user, userProjectGroups, projectIri);
    })
  );

  get projectIri() {
    return this._projectService.uuidToIri(this.projectUuid);
  }

  @Select(UserSelectors.user) user$!: Observable<ReadUser>;
  @Select(UserSelectors.userProjectAdminGroups) userProjectAdminGroups$!: Observable<string[]>;
  @Select(ProjectsSelectors.isCurrentProjectAdminOrSysAdmin) isCurrentProjectAdminOrSysAdmin!: Observable<boolean>;
  @Select(ProjectsSelectors.isCurrentProjectMember) isProjectMember$!: Observable<boolean>;
  @Select(ProjectsSelectors.currentProject) currentProject$!: Observable<ReadProject>;
  @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$!: Observable<boolean>;
  @Select(ProjectsSelectors.isMembershipLoading) isMembershipLoading$!: Observable<boolean>;
  @Select(ProjectsSelectors.projectMembers) projectMembers$!: Observable<IKeyValuePairs<ReadUser>>;

  constructor(
    protected _store: Store,
    protected _route: ActivatedRoute,
    protected _projectService: ProjectService,
    protected _titleService: Title,
    protected _router: Router,
    protected _cd: ChangeDetectorRef,
    protected _actions$: Actions
  ) {
    this.projectUuid = this._route.snapshot.params.uuid
      ? this._route.snapshot.params.uuid
      : this._route.parent.snapshot.params.uuid;
  }

  onInit(): void {
    this._loadMembership();
    this._loadProject();
  }

  onDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  protected getCurrentProject(projects: ReadProject[]) {
    if (!this.projectUuid || !projects) {
      return null;
    }

    return projects.find(x => x.id.split('/').pop() === this.projectUuid);
  }

  private _loadProject(): void {
    this.isProjectsLoading$
      .pipe(takeWhile(isLoading => isLoading === false && this.projectUuid !== undefined))
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
          if (!this.project || this.project.id !== this.projectIri) {
            // get current project data, project members and project groups
            // and set the project state here
            this._actions$
              .pipe(ofActionSuccessful(LoadProjectsAction))
              .pipe(take(1))
              .subscribe(() => this.setProjectData());
            this._store.dispatch([new LoadProjectsAction()]);
          } else if (!this.isOntologiesAvailable()) {
            this._store.dispatch(new LoadProjectOntologiesAction(this.projectUuid));
          }
        },
      });
  }

  private _loadMembership(): void {
    this.isMembershipLoading$
      .pipe(takeWhile(isMembershipLoading => isMembershipLoading === false && this.projectUuid !== undefined))
      .pipe(take(1))
      .subscribe({
        next: () => {
          const projectMembers = this._store.selectSnapshot(ProjectsSelectors.projectMembers)[this.projectIri];
          if (!projectMembers) {
            this._store.dispatch(new LoadProjectMembershipAction(this.projectUuid));
          }
        },
      });
  }

  private setProjectData(): void {
    this.project = this._store.selectSnapshot(ProjectsSelectors.currentProject);
    if (!this.project) {
      return;
    }

    this._titleService.setTitle(this.project.shortname);
    this._store.dispatch(new LoadProjectOntologiesAction(this.project.id));
  }

  protected static navigationEndFilter(event: Observable<any>) {
    return event.pipe(
      filter(e => e instanceof NavigationEnd),
      filter(e => !(e as NavigationEnd).url.startsWith('api'))
    );
  }

  private isOntologiesAvailable(): boolean {
    const currentProjectOntologies = this._store.selectSnapshot(OntologiesSelectors.currentProjectOntologies);
    return (
      currentProjectOntologies &&
      currentProjectOntologies.length > 0 &&
      currentProjectOntologies.some(o =>
        this.project.ontologies.some(ontoName => o.id.split('/').find(x => x === ontoName.split('/').pop()))
      )
    );
  }
}
