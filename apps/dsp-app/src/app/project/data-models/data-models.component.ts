import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ListNodeInfo,
    OntologyMetadata,
    ReadUser,
} from '@dasch-swiss/dsp-js';
import {AppConfigService, RouteConstants} from '@dasch-swiss/vre/shared/app-config';
import { OntologyService } from '../ontology/ontology.service';
import { Select, Store } from '@ngxs/store';
import { ListsSelectors, OntologiesSelectors, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

// the routes available for navigation
type DataModelRoute =
    typeof RouteConstants.ontology
    | typeof RouteConstants.addOntology
    | typeof RouteConstants.list
    | typeof RouteConstants.addList
    | 'docs';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-data-models',
    templateUrl: './data-models.component.html',
    styleUrls: ['./data-models.component.scss'],
})
export class DataModelsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
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
    @Select(ListsSelectors.listsInProject) listsInProject$: Observable<ListNodeInfo[]>;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _appInit: AppConfigService,
        private _store: Store,
        private _projectService: ProjectService,
    ) {
    }

    ngOnInit(): void {
        const uuid = this._route.parent.snapshot.params.uuid;
        //TODO Soft or Hard loading?
        //this._store.dispatch(new LoadListsInProjectAction(uuid)); 
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
    
    trackByFn = (index: number, item: ListNodeInfo) => `${index}-${item.id}`;

    trackByOntologyMetaFn = (index: number, item: OntologyMetadata) => `${index}-${item.id}`;

    /**
     * handles routing to the correct path
     * @param route path to route to
     * @param id optional ontology id or list id
     */
    open(route: DataModelRoute, id?: string) {

        if (route === RouteConstants.ontology && id) {
            // get name of ontology
            const ontoName = OntologyService.getOntologyName(id);
            this._router.navigate(
                [route, encodeURIComponent(ontoName), RouteConstants.editor, RouteConstants.classes],
                { relativeTo: this._route.parent }
            );
            return;
        }
        if (route === RouteConstants.list && id) {
            const listName = id.split('/').pop();
            // route to the list editor
            this._router.navigate([route, encodeURIComponent(listName)], {
                relativeTo: this._route.parent,
            });
            return;
        } else if (route === 'docs') {
            // route to the external docs
            window.open(
                'https://docs.dasch.swiss/latest/DSP-APP/user-guide/project/#data-model',
                '_blank'
            );
            return;
        } else {
            // default routing
            this._router.navigate([route], { relativeTo: this._route.parent });
        }
    }
}
