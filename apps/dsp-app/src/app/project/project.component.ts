import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import {
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
    ReadUser,
} from '@dasch-swiss/dsp-js';
import { AppGlobal } from '../app-global';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { MenuItem } from '../main/declarations/menu-item';
import {
    ComponentCommunicationEventService,
    Events,
} from '@dsp-app/src/app/main/services/component-communication-event.service';
import { Observable, Subscription, of, combineLatest } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { LoadProjectAction, LoadProjectGroupsAction, LoadProjectMembersAction, LoadProjectOntologiesAction, OntologiesSelectors, ProjectsSelectors, SetCurrentProjectAction,  UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { map, take } from 'rxjs/operators';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
})
export class ProjectComponent implements OnInit {
    @ViewChild('sidenav') sidenav: MatSidenav;

    routeConstants = RouteConstants;

    color = 'primary';

    // error in case of wrong project code
    error: boolean;

    // permissions of logged-in user
    isProjectAdmin = false;
    isProjectMember = false;

    // project uuid; as identifier in project application state service
    projectUuid: string;

    navigation: MenuItem[] = AppGlobal.projectNav;

    listItemSelected = '';

    componentCommsSubscription: Subscription;

    sideNavOpened = true;

    get isCurrentProject(): boolean {
        return this.projectUuid === this._route.snapshot.params.uuid
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
        
        return this.store.select(OntologiesSelectors.projectOntologies)
            .pipe(
                map(ontologies => {
                    if (!ontologies || !ontologies[this.projectUuid]) {
                        return [];
                    }

                    ontologies[this.projectUuid].readOntologies
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
        private _route: ActivatedRoute,
        private _router: Router,
        private _titleService: Title,
        private projectService: ProjectService,
        private store: Store,
    ) {
        // get the uuid of the current project
        this.projectUuid = this._route.snapshot.params.uuid;
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

        // get current project data, project members and project groups
        // and set the project state here
        this.store.dispatch(new LoadProjectAction(this.projectUuid))
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

    private getCurrentProject(projects: ReadProject[]): ReadProject {
        if (!projects) {
            return null;
        }

        return projects.find(x => x.id.split('/').pop() === this.projectUuid);
    }

    private SetProjectData(readProject: ReadProject): void {
        if (!readProject) {
            return;
        }

        // set the page title
        this._titleService.setTitle(readProject.shortname);

        if (!readProject.status) {
            this.color = 'warn';
        }

        this.navigation[0].label = 'Project: ' + readProject.shortname.toUpperCase();

        const user = this.store.selectSnapshot(UserSelectors.user) as ReadUser;
        const userProjectGroups = this.store.selectSnapshot(UserSelectors.userProjectGroups);
        // is logged-in user projectAdmin?
        if (user) {
            this.isProjectAdmin = this.projectService.isProjectAdmin(user, userProjectGroups, readProject.id);
            this.isProjectMember = this.projectService.isProjectMember(user, userProjectGroups, readProject.id);
        }

        // set the state of project members and groups
        if (this.isCurrentProject) {
            this.store.dispatch(new SetCurrentProjectAction(readProject, this.isProjectAdmin));
            if (this.isProjectAdmin) {
                this.store.dispatch(new LoadProjectMembersAction(readProject.id));
                this.store.dispatch(new LoadProjectGroupsAction(readProject.id));
            }
        }
        
        this.store.dispatch(new LoadProjectOntologiesAction(readProject.id));
    }
}
