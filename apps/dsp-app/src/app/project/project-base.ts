import { ChangeDetectorRef, Directive, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ReadProject } from '@dasch-swiss/dsp-js';
import { CurrentProjectSelectors, LoadProjectAction, LoadProjectOntologiesAction } from '@dasch-swiss/vre/shared/app-state';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { ProjectService } from '../workspace/resource/services/project.service';
import { Title } from '@angular/platform-browser';

@Directive()
export class ProjectBase implements OnInit, OnDestroy {
    destroyed$ = new Subject<void>();

    projectUuid: string;

    get projectIri() {
        return this._projectService.uuidToIri(this.projectUuid);
    }
    
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;
    @Select(CurrentProjectSelectors.isProjectAdmin) isProjectAdmin$: Observable<boolean>;
    @Select(CurrentProjectSelectors.isProjectMember) isProjectMember$: Observable<boolean>;

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
        const currentProject = this._store.selectSnapshot(CurrentProjectSelectors.project);
        if (this.projectUuid && (!currentProject || currentProject.id !== this.projectIri)) {
            this.loadProject();
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
        this._store.dispatch(new LoadProjectAction(this.projectUuid, true));
        this._actions$.pipe(ofActionSuccessful(LoadProjectAction))
            .pipe(take(1))
            .subscribe(() => this.setProjectData());
    }

    private setProjectData(): void {
        const readProject = this._store.selectSnapshot(CurrentProjectSelectors.project);
        if (!readProject) {
            return;
        }

        this._titleService.setTitle(readProject.shortname);
        this._store.dispatch(new LoadProjectOntologiesAction(readProject.id));
    }

    protected static navigationEndFilter(event: Observable<any>) {
        return event.pipe(
            filter((e) => e instanceof NavigationEnd),
            filter((e) => !(e as NavigationEnd).url.startsWith('api'))
        );
    }
}
