import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadProject, ReadUser } from '@dasch-swiss/dsp-js';
import { CurrentProjectSelectors, LoadProjectAction, LoadProjectGroupsAction, LoadProjectMembersAction, LoadProjectOntologiesAction, OntologiesSelectors, SetCurrentProjectAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { ProjectService } from '../workspace/resource/services/project.service';
import { Title } from '@angular/platform-browser';

@Directive()
export class ProjectBase implements OnInit, OnDestroy {
    destroyed$ = new Subject<void>();

    projectUuid: string;

    // permissions of logged-in user
    isProjectAdmin = false;
    isProjectMember = false;
    
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;

    constructor(
        protected _store: Store,
        protected _route: ActivatedRoute,
        protected _projectService: ProjectService,
        protected _titleService: Title,
        protected _router: Router,
        protected _cd: ChangeDetectorRef,
        protected _actions$: Actions,
    ) {
        // get the uuid of the current project
        this.projectUuid = this._route.snapshot.params.uuid 
            ? this._route.snapshot.params.uuid
            : this._route.parent.snapshot.params.uuid;
    }

    ngOnInit(): void {
        const currentProject = this._store.selectSnapshot(CurrentProjectSelectors.project)
        if (this.projectUuid 
            && (!currentProject || currentProject.id !== this._projectService.uuidToIri(this.projectUuid))) {
            this.loadProject();
        } else if (this.projectUuid 
            && (currentProject && currentProject.id === this._projectService.uuidToIri(this.projectUuid))) {
                const projectOntologies = this._store.selectSnapshot(OntologiesSelectors.projectOntologies);
                const projectIri = this._projectService.uuidToIri(this.projectUuid);
                if (currentProject.ontologies.length > 0 
                    && (!projectOntologies[projectIri] || projectOntologies[projectIri].readOntologies.length === 0)) {
                    this._store.dispatch(new LoadProjectOntologiesAction(currentProject.id));
                }
        }
    }

    ngOnDestroy(): void {
        //this._store.dispatch([new ClearCurrentProjectAction(), new ClearProjectOntologiesAction(this.projectUuid)]);
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    protected getCurrentProject(projects: ReadProject[]): ReadProject {
        if (!projects) {
            return null;
        }

        return projects.find(x => x.id.split('/').pop() === this.projectUuid);
    }
    
    private loadProject(): void {
        // get current project data, project members and project groups
        // and set the project state here
        this._store.dispatch(new LoadProjectAction(this.projectUuid))
            .pipe(
                take(1),
                map((state: any) => {
                    return state.projects.readProjects;
                })
            )
            .subscribe((readProjects: ReadProject[]) => {
                return this.SetProjectData(this.getCurrentProject(readProjects));
            });
    }

    private SetProjectData(readProject: ReadProject): void {
        if (!readProject) {
            return;
        }

        // set the page title
        this._titleService.setTitle(readProject.shortname);

        const user = this._store.selectSnapshot(UserSelectors.user) as ReadUser;
        const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectAdminGroups);
        // is logged-in user projectAdmin?
        if (user) {
            this.isProjectAdmin = this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, readProject.id);
            this.isProjectMember = this._projectService.isProjectMember(user, userProjectGroups, readProject.id);
        }

        // set the state of project members and groups
        this._store.dispatch(new SetCurrentProjectAction(readProject, this.isProjectAdmin));
        if (this.isProjectAdmin) {
            this._store.dispatch(new LoadProjectMembersAction(readProject.id));
            this._store.dispatch(new LoadProjectGroupsAction(readProject.id));
        }
        
        this._store.dispatch(new LoadProjectOntologiesAction(readProject.id));
        this._actions$.pipe(ofActionSuccessful(LoadProjectOntologiesAction))
            .pipe(take(1))
            .subscribe(() => this._cd.markForCheck());
    }

    protected static navigationEndFilter(event: Observable<any>) {
        return event.pipe(
            filter((e) => e instanceof NavigationEnd),
            filter((e) => !(e as NavigationEnd).url.startsWith('api'))
        );
    }
}
