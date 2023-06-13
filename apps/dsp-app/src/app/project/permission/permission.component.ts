import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
    ApiResponseError,
    KnoraApiConnection,
    ReadGroup,
    ReadProject,
} from '@dasch-swiss/dsp-js';
import { ApplicationStateService } from '@dsp-app/src/app/main/cache/application-state.service';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { ErrorHandlerService } from '@dsp-app/src/app/main/services/error-handler.service';
import {
    Session,
    SessionService,
} from '@dsp-app/src/app/main/services/session.service';
import { AddGroupComponent } from './add-group/add-group.component';

@Component({
    selector: 'app-permission',
    templateUrl: './permission.component.html',
    styleUrls: ['./permission.component.scss'],
})
export class PermissionComponent implements OnInit {
    @ViewChild('addGroupComponent') addGroup: AddGroupComponent;

    // loading for progess indicator
    loading: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin = false;
    projectAdmin = false;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    // project data
    project: ReadProject;

    // project members
    projectGroups: ReadGroup[] = [];

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _applicationStateService: ApplicationStateService,
        private _errorHandler: ErrorHandlerService,
        private _route: ActivatedRoute,
        private _session: SessionService,
        private _titleService: Title
    ) {
        this._route.parent.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });

        // set the page title
        this._titleService.setTitle(
            'Project ' + this.projectUuid + ' | Permission Groups'
        );
    }

    ngOnInit() {
        // get information about the logged-in user
        this.session = this._session.getSession();

        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // get the project data from application state
        this._applicationStateService.get(this.projectUuid).subscribe(
            (response: ReadProject) => {
                this.project = response;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin
                    ? this.sysAdmin
                    : this.session.user.projectAdmin.some(
                          (e) => e === this.project.id
                      );

                this.initList();

                this.loading = false;
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
                this.loading = false;
            }
        );
    }

    /**
     * build the list of members
     */
    initList(): void {}
    /**
     * refresh list of members after adding a new user to the team
     */
    refresh(): void {
        // referesh the component
        this.loading = true;
        // update the application state
        this._applicationStateService.del('members_of_' + this.projectUuid);

        this.initList();

        // refresh child component: add user
        if (this.addGroup) {
            this.addGroup.buildForm();
        }
    }
}
