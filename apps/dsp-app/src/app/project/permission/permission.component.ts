import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
    ReadGroup,
    ReadProject,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { AddGroupComponent } from './add-group/add-group.component';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { CurrentProjectSelectors, SetCurrentProjectMembersAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { ProjectService } from '../../workspace/resource/services/project.service';

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss'],
})
export class PermissionComponent implements OnInit {
    @ViewChild('addGroupComponent') addGroup: AddGroupComponent;

    // loading for progess indicator
    loading: boolean;

    isProjectAdmin = false;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    // project data
    project: ReadProject;

    // project members
    projectGroups: ReadGroup[] = [];

    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(CurrentProjectSelectors.project) project$: Observable<ReadProject>;

    constructor(
        private _projectService: ProjectService,
        private _route: ActivatedRoute,
        private _titleService: Title,
        private _store: Store,
    ) {
        this._route.parent.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });

        // set the page title
        this._titleService.setTitle('Project ' + this.projectUuid + ' | Permission Groups');
    }

    ngOnInit() {
        this.project = this._store.selectSnapshot(CurrentProjectSelectors.project);
        const user = this._store.selectSnapshot(UserSelectors.user) as ReadUser;
        const userProjectGroups = this._store.selectSnapshot(UserSelectors.userProjectAdminGroups);
        // is logged-in user projectAdmin?
        this.isProjectAdmin = this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, this.project.id);;

        this.initList();
    }

    /**
     * build the list of members
     */
    initList(): void {}
    /**
     * refresh list of members after adding a new user to the team
     */
    refresh(): void {
        this._store.dispatch(new SetCurrentProjectMembersAction([]));
        this.initList();

        // refresh child component: add user
        if (this.addGroup) {
            this.addGroup.buildForm();
        }
    }
}
