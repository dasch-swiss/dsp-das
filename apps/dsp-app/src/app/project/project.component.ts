import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    OntologiesMetadata,
    ProjectResponse,
    ReadOntology,
    ReadProject,
    UserResponse
} from '@dasch-swiss/dsp-js';
import { AppGlobal } from '../app-global';
import { AppInitService } from '../app-init.service';
import { CacheService } from '../main/cache/cache.service';
import { DspApiConnectionToken } from '../main/declarations/dsp-api-tokens';
import { MenuItem } from '../main/declarations/menu-item';
import { ErrorHandlerService } from '../main/services/error-handler.service';
import { ComponentCommunicationEventService, Events } from '@dsp-app/src/app/main/services/component-communication-event.service';
import { Session, SessionService } from '../main/services/session.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
    @ViewChild('sidenav') sidenav: MatSidenav;

    // loading for progress indicator
    loading: boolean;
    // error in case of wrong project code
    error: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin = false;
    projectAdmin = false;
    projectMember = false;

    // project uuid; as identifier in project cache service
    projectUuid: string;

    // project iri; used for API requests
    iri: string;

    // project data
    project: ReadProject;

    color = 'primary';

    navigation: MenuItem[] = AppGlobal.projectNav;

    ontologies: ReadOntology[] = [];

    // list of project ontologies
    projectOntologies: ReadOntology[] = [];

    listItemSelected = '';

    componentCommsSubscription: Subscription;

    sideNavOpened = true;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _componentCommsService: ComponentCommunicationEventService,
        private _cache: CacheService,
        private _route: ActivatedRoute,
        private _router: Router,
        private _session: SessionService,
        private _titleService: Title,
        private _ais: AppInitService,
    ) {
        // get the uuid of the current project
        this.projectUuid = this._route.snapshot.params.uuid;

        // create the project iri
        this.iri = `${this._ais.dspAppConfig.iriBase}/projects/${this.projectUuid}`;

        // get session
        this.session = this._session.getSession();
    }

    /**
     * add keyboard support to expand/collapse sidenav
     * @param event automatically passed whenever the user types
     */
    @HostListener('window:keyup', ['$event'])
    keyEvent(event: KeyboardEvent) {
        if(event.key === '['){
          this.toggleSidenav();
        }
      }

    ngOnInit() {
        this.componentCommsSubscription = this._componentCommsService.on(
            Events.unselectedListItem,
            () => {
                this.listItemSelected = '';
            }
        );

        if (!this.error) {
            this.loading = true;
            // get current project data, project members and project groups
            // and set the project cache here
            this._dspApiConnection.admin.projectsEndpoint.getProjectByIri(this.iri).subscribe(
                (response: ApiResponseData<ProjectResponse>) => {
                    this.project = response.body.project;

                    // set the page title
                    this._titleService.setTitle(this.project.shortname);

                    this._cache.set(this.projectUuid, this.project);

                    if (!this.project.status) {
                        this.color = 'warn';
                    }

                    this.navigation[0].label = 'Project: ' + response.body.project.shortname.toUpperCase();

                    // is logged-in user projectAdmin?
                    if (this.session) {
                        this._session.setSession(this.session.user.jwt, this.session.user.name, 'username');
                        this.session = this._session.getSession();

                        // is the logged-in user system admin?
                        this.sysAdmin = this.session.user.sysAdmin;

                        // is the logged-in user project admin?
                        this.projectAdmin = this.sysAdmin ? this.sysAdmin : (this.session.user.projectAdmin.some(e => e === this.project.id));

                        // or at least project member?
                        if (!this.projectAdmin) {
                            this._dspApiConnection.admin.usersEndpoint.getUserByUsername(this.session.user.name).subscribe(
                                (res: ApiResponseData<UserResponse>) => {
                                    const usersProjects = res.body.user.projects;
                                    if (usersProjects.length === 0) {
                                        // the user is not part of any project
                                        this.projectMember = false;
                                    } else {
                                        // check if the user is member of the current project
                                        // id contains the iri
                                        this.projectMember = usersProjects.some(p => p.id === this.iri);
                                    }
                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                }
                            );
                        } else {
                            this.projectMember = this.projectAdmin;
                        }

                    }

                    // set the cache for project members and groups
                    if (this.projectAdmin) {
                        this._cache.get('members_of_' + this.projectUuid, this._dspApiConnection.admin.projectsEndpoint.getProjectMembersByIri(this.iri));
                        this._cache.get('groups_of_' + this.projectUuid, this._dspApiConnection.admin.groupsEndpoint.getGroups());
                    }

                    // get all project ontologies
                    this._dspApiConnection.v2.onto.getOntologiesByProjectIri(this.iri).subscribe(
                        (ontoMeta: OntologiesMetadata) => {
                            if (ontoMeta.ontologies.length) {
                                ontoMeta.ontologies.forEach(onto => {
                                    this._dspApiConnection.v2.onto.getOntology(onto.id).subscribe(
                                        (ontology: ReadOntology) => {
                                            this.projectOntologies.push(ontology);
                                            this.projectOntologies
                                                .sort((o1, o2) => this._compareOntologies(o1, o2));
                                            this.ontologies.push(ontology);
                                            if (ontoMeta.ontologies.length === this.ontologies.length) {
                                                this._cache.set('currentProjectOntologies', this.ontologies);
                                                this.loading = !this._cache.has(this.projectUuid);
                                            }
                                        },
                                        (error: ApiResponseError) => {
                                            this.loading = false;
                                            this._errorHandler.showMessage(error);
                                        }
                                    );
                                });
                            } else {
                                this.loading = !this._cache.has(this.projectUuid);
                            }
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                        }
                    );

                },
                (error: ApiResponseError) => {
                    this.error = true;
                    this.loading = false;
                }
            );
        }
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

    /**
     * compare function which sorts the ontologies in the ascending order.
     *
     * @param o1 ontology 1
     * @param o2 ontology 2
     * @private
     */
    private _compareOntologies(o1: ReadOntology, o2: ReadOntology) {
        if (o1.label > o2.label) {
            return 1;
        }

        if (o1.label < o2.label) {
            return -1;
        }

        return 0;
    }
}
