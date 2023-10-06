import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
    ReadProject, ReadUser} from '@dasch-swiss/dsp-js';
import { Observable, combineLatest, of } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { map, take } from 'rxjs/operators';
import { ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';

@Component({
    selector: 'app-description',
    templateUrl: './description.component.html',
    styleUrls: ['./description.component.scss'],
})
export class DescriptionComponent implements OnInit {
    // project uuid coming from the route
    projectUuid: string;

    get readProject$(): Observable<ReadProject> {
        if (!this.projectUuid) {
            return of({} as ReadProject);
        }

        return this.readProjects$.pipe(
            take(1),
            map(projects => this.getCurrentProject(projects))
        );
    }

    get userHasPermission$(): Observable<boolean> {
        return combineLatest([
            this.user$,
            this.readProject$,
            this.store.select(UserSelectors.userProjectGroups)
        ]).pipe(
            map(([user, readProject, userProjectGroups]: [ReadUser, ReadProject, string[]]) => {
                if (readProject == null || userProjectGroups.length === 0) {
                    return false;
                }
                
                return this.projectService.isProjectAdmin(user, userProjectGroups, readProject.id);
            })
        );
    }

    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(ProjectsSelectors.readProjects) readProjects$: Observable<ReadProject[]>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private store: Store,
        private projectService: ProjectService,
    ) {
        // get the uuid of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });
    }

    ngOnInit() {
        this.initProject();
    }

    /**
     * initProject: get the project data from the application state service and update
     * if the user has permission to edit the project if not a sysadmin
     */
    initProject() {
        
    }
    
    editProject() {
        this._router.navigate(['project', this.projectUuid, 'edit']);
    }

    private getCurrentProject(projects: ReadProject[]): ReadProject {
        if (!projects) {
            return null;
        }

        return projects.find(x => x.id.split('/').pop() === this.projectUuid);
    }
}
