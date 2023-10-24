import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    ListNodeInfo,
    ListsResponse,
    OntologyMetadata,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { OntologyService } from '../ontology/ontology.service';
import { Select, Store } from '@ngxs/store';
import { OntologiesSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-data-models',
    templateUrl: './data-models.component.html',
    styleUrls: ['./data-models.component.scss'],
})
export class DataModelsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    projectLists: ListNodeInfo[];

    // permissions of logged-in user
    get isAdmin$(): Observable<boolean> {
        return combineLatest([this.user$, this.userProjectAdminGroups$, this._route.parent.params])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map(([user, userProjectGroups, params]) => {
                    return this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, params.uuid);
                })
            )
    }

    get ontologiesMetadata$(): Observable<OntologyMetadata[]> {
        const uuid = this._route.parent.snapshot.params.uuid;
        const iri = `${this._appInit.dspAppConfig.iriBase}/projects/${uuid}`;
        if (!uuid) {
            return of({} as OntologyMetadata[]);
        }
        
        return this._store.select(OntologiesSelectors.projectOntologies)
            .pipe(
                map(ontologies => {
                    if (!ontologies || !ontologies[iri]) {
                        return [];
                    }

                    return ontologies[iri].ontologiesMetadata;
                })
            )
    }

    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.userProjectAdminGroups) userProjectAdminGroups$: Observable<string[]>;
    @Select(UserSelectors.isLoggedIn) isLoggedIn$: Observable<boolean>;
    @Select(OntologiesSelectors.isLoading) isLoading$: Observable<boolean>;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler,
        private _route: ActivatedRoute,
        private _router: Router,
        private _appInit: AppConfigService,
        private _store: Store,
        private _projectService: ProjectService,
    ) {
    }

    ngOnInit(): void {
        const uuid = this._route.parent.snapshot.params.uuid;
        const iri = `${this._appInit.dspAppConfig.iriBase}/projects/${uuid}`;

        // get all project lists
        this._dspApiConnection.admin.listsEndpoint
            .getListsInProject(iri)
            .subscribe(
                (lists: ApiResponseData<ListsResponse>) => {
                    this.projectLists = lists.body.lists;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * handles routing to the correct path
     * @param route path to route to
     * @param id optional ontology id or list id
     */
    open(route: string, id?: string) {
        let name;

        if (route === 'ontology' && id) {
            // get name of ontology
            name = OntologyService.getOntologyName(id);
        }
        if (route === 'list' && id) {
            // get name of list
            const array = id.split('/');
            const pos = array.length - 1;
            name = array[pos];
        }
        if (name) {
            if (route === 'ontology') {
                // route to the onto editor
                this._router.navigate(
                    [route, encodeURIComponent(name), 'editor', 'classes'],
                    { relativeTo: this._route.parent }
                );
            } else {
                // route to the list editor
                this._router.navigate([route, encodeURIComponent(name)], {
                    relativeTo: this._route.parent,
                });
            }
        } else if (route === 'docs') {
            // route to the external docs
            window.open(
                'https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model',
                '_blank'
            );
        } else {
            // fallback default routing
            this._router.navigate([route], { relativeTo: this._route.parent });
        }
    }
}
