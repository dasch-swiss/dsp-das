import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApiResponseError,
    ListNodeInfo,
    ReadUser,
    StringLiteral,
} from '@dasch-swiss/dsp-js';
import { AppGlobal } from '@dsp-app/src/app/app-global';
import {AppConfigService, RouteConstants} from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { ProjectBase } from '../project-base';
import { Actions, Select, Store, ofActionErrored, ofActionSuccessful } from '@ngxs/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { CurrentProjectSelectors, DeleteListNodeAction, ListsSelectors, LoadListsInProjectAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
})
export class ListComponent extends ProjectBase implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    // loading for progress indicator
    loading: boolean;
    //loadList: boolean;

    // list of languages
    languagesList: StringLiteral[] = AppGlobal.languagesList;

    // current selected language
    language: string;

    // selected list iri
    listIri: string = undefined;

    openPanel: number;

    // i18n plural mapping
    itemPluralMapping = {
        list: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '=1': '1 list',
            other: '# lists',
        },
    };

    // disable content on small devices
    disableContent = false;
    
    get isAdmin$(): Observable<boolean> {
        return combineLatest([this.user$, this.userProjectAdminGroups$, this._route.parent.params])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map(([user, userProjectGroups, params]) => {
                    return this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, params.uuid);
                })
            )
    }

    get list$(): Observable<ListNodeInfo> {
        return this.listsInProject$.pipe(
            map(lists => this.listIri
                ? lists.find((i) => i.id === this.listIri)
                : null
            ));
    }
    
    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.userProjectAdminGroups) userProjectAdminGroups$: Observable<string[]>;
    @Select(ListsSelectors.isListsLoading) isListsLoading$: Observable<boolean>;
    @Select(ListsSelectors.listsInProject) listsInProject$: Observable<ListNodeInfo[]>;

    constructor(
        private _acs: AppConfigService,
        private _dialog: MatDialog,
        private _errorHandler: AppErrorHandler,
        protected _route: ActivatedRoute,
        protected _router: Router,
        protected _titleService: Title,
        protected _projectService: ProjectService,
        protected _store: Store,
        protected _cd: ChangeDetectorRef,
        protected _actions$: Actions
    ) {
        super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
    }

    @HostListener('window:resize', ['$event']) onWindowResize() {
        this.disableContent = window.innerWidth <= 768;
        // reset the page title
        if (!this.disableContent) {
            this._setPageTitle();
        }
    }

    ngOnInit() {
        super.ngOnInit();
        this.disableContent = window.innerWidth <= 768;

        // set the page title
        this._setPageTitle();


        // get list iri from list name
        this._route.params.subscribe((params) => {
            this.listIri = `${this._acs.dspAppConfig.iriBase}/lists/${this.projectUuid}/${params['list']}`;
            //this._store.dispatch(new LoadListsInProjectAction(this.projectIri));
        });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * open dialog in every case of modification:
     * edit list data, remove list from project etc.
     *
     */
    openDialog(mode: string, name: string, iri?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '640px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: {
                mode: mode,
                title: name,
                id: iri,
                project: this.projectUuid,
            },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((data) => {
            switch (mode) {
                case 'editListInfo': {
                    window.location.reload();
                    break;
                }
                case 'deleteList': {
                    if (typeof data === 'boolean' && data === true) {
                        this._store.dispatch(new DeleteListNodeAction(this.listIri));
                        this._actions$.pipe(ofActionSuccessful(DeleteListNodeAction))
                            .pipe(take(1))
                            .subscribe(() => {
                                this._store.dispatch(new LoadListsInProjectAction(this.projectIri));
                                this._router.navigate([RouteConstants.project, this.projectUuid,RouteConstants.dataModels])
                                    .then(() => {
                                        // refresh whole page; todo: would be better to use an event emitter to the parent to update the list of resource classes
                                        window.location.reload();
                                    });
                            });
                    }
                    break;
                }
            }
        });
    }

    private _setPageTitle() {
        const project = this._store.selectSnapshot(CurrentProjectSelectors.project);
        this._titleService.setTitle(`Project ${project?.shortname} | List ${this.listIri ? '' : 's'}`);
    }
}
