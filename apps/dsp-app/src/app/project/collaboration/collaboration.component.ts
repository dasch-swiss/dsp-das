import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
    ReadProject,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { AddUserComponent } from './add-user/add-user.component';
import { Select, Store } from '@ngxs/store';
import { CurrentProjectSelectors, LoadProjectMembersAction, ProjectsSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-collaboration',
    templateUrl: './collaboration.component.html',
    styleUrls: ['./collaboration.component.scss'],
})
export class CollaborationComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    @ViewChild('addUserComponent') addUser: AddUserComponent;

    // loading for progess indicator
    loading: boolean;

    isProjectAdmin = false;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    get activeProjectMembers$(): Observable<ReadUser[]> {
        return this.projectMembers$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((projectMembers) => {
                    const members = projectMembers[this._projectService.uuidToIri(this.projectUuid)].value;
                    return members.filter(member => member.status === true);
                })
            );
    }

    get inactiveProjectMembers$(): Observable<ReadUser[]> {
        return this.projectMembers$
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((projectMembers) => {
                    return projectMembers[this._projectService.uuidToIri(this.projectUuid)].value.filter(member => !member.status);
                })
            );
    }
    
    @Select(ProjectsSelectors.projectMembers) projectMembers$: Observable<ReadUser[]>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;
    
    constructor(
        private _route: ActivatedRoute,
        private _projectService: ProjectService,
        private _titleService: Title,
        private _store: Store,
    ) {
        // get the uuid of the current project
        if (this._route.parent.parent.snapshot.url.length) {
            this._route.parent.parent.paramMap.subscribe((params: Params) => {
                this.projectUuid = params.get('uuid');
            });
        }
    }

    ngOnInit() {
        const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectAdminGroups);
        const user = this._store.selectSnapshot(UserSelectors.user) as ReadUser;
        const project = this._store.selectSnapshot(CurrentProjectSelectors.project) as ReadProject;
        this._titleService.setTitle(`Project ${project.shortname} | Collaboration`);
        // is logged-in user projectAdmin?
        this.isProjectAdmin = this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, project.id);

        // get list of project members and groups
        if (this.isProjectAdmin) {
            this.refresh();
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * refresh list of members after adding a new user to the team
     */
    refresh(): void {
        const projectIri = this._projectService.uuidToIri(this.projectUuid);
        this._store.dispatch(new LoadProjectMembersAction(projectIri));

        // refresh child component: add user
        if (this.addUser) {
            this.addUser.buildForm();
        }
    }
}
