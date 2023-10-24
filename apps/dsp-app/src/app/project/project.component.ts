import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ReadOntology,
    ReadProject,
} from '@dasch-swiss/dsp-js';
import { MaterialColor, RouteConstants, getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-config';
import {
    ComponentCommunicationEventService,
    Events,
} from '@dsp-app/src/app/main/services/component-communication-event.service';
import { Observable, Subscription, of, combineLatest } from 'rxjs';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { LoadProjectOntologiesAction, OntologiesSelectors, ProjectsSelectors } from '@dasch-swiss/vre/shared/app-state';
import { map, take } from 'rxjs/operators';
import { ProjectBase } from './project-base';
import { ClassAndPropertyDefinitions } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/ClassAndPropertyDefinitions';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
})
export class ProjectComponent extends ProjectBase implements OnInit {
    @ViewChild('sidenav') sidenav: MatSidenav;

    routeConstants = RouteConstants;

    listItemSelected = '';

    getAllEntityDefinitionsAsArray = getAllEntityDefinitionsAsArray;
    componentCommsSubscription: Subscription;
    classAndPropertyDefinitions: ClassAndPropertyDefinitions;

    sideNavOpened = true;

    get color$(): Observable<string> {
        return this.readProject$.pipe(
            map(readProject => !readProject.status 
                ? MaterialColor.Warn 
                : MaterialColor.Primary)
        );
    }

    get readProject$(): Observable<ReadProject> {
        if (!this.projectUuid) {
            return of({} as ReadProject);
        }

        return this.readProjects$.pipe(
            take(1),
            map(projects => this.getCurrentProject(projects))
        );
    }

    get projectOntologies$(): Observable<ReadOntology[]> {
        if (!this.projectUuid) {
            return of({} as ReadOntology[]);
        }
        
        return this._store.select(OntologiesSelectors.projectOntologies)
            .pipe(
                map(ontologies => {
                    const projectIri = this._projectService.uuidToIri(this.projectUuid);
                    if (!ontologies || !ontologies[projectIri]) {
                        return [];
                    }

                    return ontologies[projectIri].readOntologies;
                })
            )
    }

    get isLoading$(): Observable<boolean> {
        return combineLatest([this.isOntologiesLoading$, this.isProjectsLoading$])
            .pipe(
                map(([isOntologiesLoading, isProjectsLoading]) => {
                    return isOntologiesLoading === true || isProjectsLoading === true;
                })
            )
    }

    @Select(ProjectsSelectors.readProjects) readProjects$: Observable<ReadProject[]>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
    @Select(OntologiesSelectors.isLoading) isOntologiesLoading$: Observable<boolean>;
    @Select(OntologiesSelectors.hasLoadingErrors) hasLoadingErrors$: Observable<boolean>;
    
    constructor(
        private _componentCommsService: ComponentCommunicationEventService,
        protected _cd: ChangeDetectorRef,
        protected _actions$: Actions,
        protected _router: Router,
        protected _store: Store,
        protected _route: ActivatedRoute,
        _titleService: Title,
        _projectService: ProjectService,
    ) {
        super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
    }

    /**
     * add keyboard support to expand/collapse sidenav
     * @param event automatically passed whenever the user types
     */
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if (event.key === '[') {
            this.toggleSidenav();
        }
    }

    ngOnInit() {
        super.ngOnInit();
        switch (this._router.url) {
            case `${RouteConstants.project}/${this.projectUuid}/${RouteConstants.advancedSearch}`: {
                this.listItemSelected = RouteConstants.advancedSearch;
                break;
            }
            case `${RouteConstants.project}/${this.projectUuid}`: {
                this.listItemSelected = this._router.url;
                break;
            }
            case `${RouteConstants.project}/${this.projectUuid}/${RouteConstants.dataModels}`: {
                this.listItemSelected = RouteConstants.dataModels;
                break;
            }
            case `${RouteConstants.project}/${this.projectUuid}/${RouteConstants.settings}/${RouteConstants.collaboration}`: {
                this.listItemSelected = RouteConstants.settings;
                break;
            }
        }

        this.componentCommsSubscription = this._componentCommsService.on(
            Events.unselectedListItem,
            () => this.listItemSelected = ''
        );
    }

    ngOnDestroy() {
        // unsubscribe from the ValueOperationEventService when component is destroyed
        if (this.componentCommsSubscription !== undefined) {
            this.componentCommsSubscription.unsubscribe();
        }
    }

    open(route: string) {
        this.listItemSelected = route;
        this._router.navigate([route], { relativeTo: this._route });
    }

    /**
     * given a Html element, compare the scrollHeight and the clientHeight
     *
     * @param elem the element which has the line-clamp css
     * @returns inverse of comparison between the scrollHeight and the clientHeight of elem
     */
    compareElementHeights(elem: HTMLElement): boolean {
        return !(elem.scrollHeight > elem.clientHeight);
    }

    /**
     * toggle sidenav
     */
    toggleSidenav() {
        this.sideNavOpened = !this.sideNavOpened;
        this.sidenav.toggle();
    }
}
