import { ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {
    ApiResponseData,
    ApiResponseError,
    Constants,
    KnoraApiConnection,
    ProjectResponse,
    ProjectsResponse,
    ReadProject
} from '@dasch-swiss/dsp-js';
import { Subscription } from 'rxjs';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ComponentCommunicationEventService, Events } from 'src/app/main/services/component-communication-event.service';
import { NotificationService } from 'src/app/main/services/notification.service';
import { SortingService } from 'src/app/main/services/sorting.service';
import { SearchParams } from '../../results/list-view/list-view.component';

export interface PrevSearchItem {
    projectIri?: string;
    projectLabel?: string;
    query: string;
}

const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-fulltext-search',
    templateUrl: './fulltext-search.component.html',
    styleUrls: ['./fulltext-search.component.scss']
})
export class FulltextSearchComponent implements OnInit, OnChanges, OnDestroy {

    /**
     *
     * @param [projectfilter] If true it shows the selection
     * of projects to filter by one of them
     */
    @Input() projectfilter?: boolean = false;

    /**
     * @deprecated Use `limitToProject` instead
     *
     * @param [filterbyproject] If the full-text search should be
     * filtered by one project, you can define it with project iri.
     */
    @Input() filterbyproject?: string;

    /**
     * filter ontologies in advanced search or query in fulltext search by specified project IRI
     *
     * @param limitToProject
     */
    @Input() limitToProject?: string;


    /**
     * emits selected project in case of projectfilter
     */
    @Output() limitToProjectChange = new EventEmitter<string>();

    /**
     * the data event emitter of type SearchParams
     *
     * @param  search
     */
    @Output() search = new EventEmitter<SearchParams>();

    @ViewChild('fulltextSearchPanel', { static: false }) searchPanel: ElementRef;

    @ViewChild('fulltextSearchInput', { static: false }) searchInput: ElementRef;
    @ViewChild('fulltextSearchInputMobile', { static: false }) searchInputMobile: ElementRef;

    @ViewChild('fulltextSearchMenu', { static: false }) searchMenu: TemplateRef<any>;

    @ViewChild('btnToSelectProject', { static: false }) selectProject: MatMenuTrigger;

    // search query
    searchQuery: string;

    // previous search = full-text search history
    prevSearch: PrevSearchItem[];

    // list of projects, in case of filterproject is true
    projects: ReadProject[];

    // selected project, in case of limitToProject and/or projectfilter is true
    project: ReadProject;

    defaultProjectLabel = 'All projects';

    projectLabel: string = this.defaultProjectLabel;

    projectIri: string;

    componentCommsSubscriptions: Subscription[]= [];

    // in case of an (api) error
    error: any;

    // is search panel focused?
    searchPanelFocus = false;

    // overlay reference
    overlayRef: OverlayRef;

    // do not show the following projects: default system projects from knora
    doNotDisplay: string[] = [
        Constants.SystemProjectIRI,
        Constants.DefaultSharedOntologyIRI
    ];

    // toggle phone panel
    displayPhonePanel = false;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _notification: NotificationService,
        private _sortingService: SortingService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _componentCommsService: ComponentCommunicationEventService,
    ) { }

    ngOnInit(): void {

        // on page refresh, split the url into an array of strings and assign the `searchQuery` to the last element of this array of strings
        // this persists the search term in the search input field
        const urlArray = window.location.pathname.split('/');
        const currentSearchTerm = urlArray[urlArray.length - 1];
        if(urlArray[urlArray.length - 2] === 'fulltext') {
            this.searchQuery = decodeURI(decodeURI(currentSearchTerm));
        }

        // filterbyproject is set as deprecated. To avoid breaking changes we still support it
        if (this.filterbyproject) {
            this.limitToProject = this.filterbyproject;
        }

        // initialise prevSearch
        const prevSearchOption = JSON.parse(localStorage.getItem('prevSearch'));
        if (prevSearchOption !== null) {
            this.prevSearch = prevSearchOption;
        } else {
            this.prevSearch = [];
        }

        if (this.limitToProject) {
            this.getProject(this.limitToProject);
        }

        if (this.projectfilter) {
            this.getAllProjects();
        }

        // in the event of a grav search (advanced or expert search), clear the input field
        this.componentCommsSubscriptions.push(this._componentCommsService.on(
            Events.gravSearchExecuted, () => {
                this.searchQuery = null;
            })
        );

        this.componentCommsSubscriptions.push(this._componentCommsService.on(
            Events.projectCreated, () => {
                this.getAllProjects();
            }
        ));
    }

    ngOnChanges() {
        // resource classes have been reinitialized
        // reset form
        resolvedPromise.then(() => {

            if (localStorage.getItem('currentProject') !== null) {
                this.setProject(
                    JSON.parse(localStorage.getItem('currentProject'))
                );
            }

        });
    }

    ngOnDestroy() {
        // unsubscribe from all subscriptions incomponentCommsSubscriptions when component is destroyed
        if (this.componentCommsSubscriptions !== undefined) {
            this.componentCommsSubscriptions.forEach(sub => sub.unsubscribe());
        }
    }

    /**
     * get all public projects from DSP-API
     */
    getAllProjects(): void {
        this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
            (response: ApiResponseData<ProjectsResponse>) => {
                this.projects = response.body.projects;
                // this.loadSystem = false;
                if (localStorage.getItem('currentProject') !== null) {
                    this.project = JSON.parse(
                        localStorage.getItem('currentProject')
                    );
                }
                this.projects = this._sortingService.keySortByAlphabetical(response.body.projects, 'shortname');
            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
                this.error = error;
            }
        );
    }

    /**
     * get project by IRI
     * @param id Project Id
     */
    getProject(id: string): void {
        this._dspApiConnection.admin.projectsEndpoint.getProjectByIri(id).subscribe(
            (project: ApiResponseData<ProjectResponse>) => {
                this.setProject(project.body.project);
            },
            (error: ApiResponseError) => {
                this._notification.openSnackBar(error);
            }
        );
    }

    /**
     * set current project and switch focus to input field.
     * @params project
     */
    setProject(project?: ReadProject): void {
        if (!project) {
            // set default project: all
            this.projectLabel = this.defaultProjectLabel;
            this.projectIri = undefined;
            this.limitToProject = undefined;
            this.limitToProjectChange.emit(this.limitToProject);
            localStorage.removeItem('currentProject');
        } else {
            // set current project shortname and id
            this.projectLabel = project.shortname;
            this.projectIri = project.id;
            this.limitToProject = project.id;
            this.limitToProjectChange.emit(this.limitToProject);
            localStorage.setItem('currentProject', JSON.stringify(project));
        }
    }

    /**
     * open the search panel with backdrop
     */
    openPanelWithBackdrop(): void {
        const config = new OverlayConfig({
            hasBackdrop: true,
            backdropClass: 'cdk-overlay-transparent-backdrop',
            positionStrategy: this.getOverlayPosition(),
            scrollStrategy: this._overlay.scrollStrategies.block()
        });

        this.overlayRef = this._overlay.create(config);
        this.overlayRef.attach(new TemplatePortal(this.searchMenu, this._viewContainerRef));
        this.overlayRef.backdropClick().subscribe(() => {
            this.searchPanelFocus = false;
            if (this.overlayRef) {
                this.overlayRef.detach();
            }
        });
    }

    /**
     * return the correct overlay position
     */
    getOverlayPosition(): PositionStrategy {
        const positions = [
            new ConnectionPositionPair({ originX: 'start', originY: 'bottom' }, { overlayX: 'start', overlayY: 'top' }),
            new ConnectionPositionPair({ originX: 'start', originY: 'top' }, { overlayX: 'start', overlayY: 'bottom' })
        ];

        // tslint:disable-next-line: max-line-length
        const overlayPosition = this._overlay.position().flexibleConnectedTo(this.searchPanel).withPositions(positions).withLockedPosition(false);

        return overlayPosition;
    }

    /**
     * send the search query to parent and store the new query in the local storage
     * to have a search history list
     */
    doSearch(): void {

        if (this.searchQuery !== undefined && this.searchQuery !== null) {

            // push the search query into the local storage prevSearch array (previous search)
            // to have a list of recent search requests
            let existingPrevSearch: PrevSearchItem[] = JSON.parse(
                localStorage.getItem('prevSearch')
            );
            if (existingPrevSearch === null) {
                existingPrevSearch = [];
            }
            let i = 0;
            for (const entry of existingPrevSearch) {
                // remove entry, if exists already
                if (this.searchQuery === entry.query && this.projectIri === entry.projectIri) {
                    existingPrevSearch.splice(i, 1);
                }
                i++;
            }

            // a search value is expected to have at least length of 3
            if (this.searchQuery.length > 2) {
                let currentQuery: PrevSearchItem = {
                    query: this.searchQuery
                };

                if (this.projectIri) {
                    currentQuery = {
                        projectIri: this.projectIri,
                        projectLabel: this.projectLabel,
                        query: this.searchQuery
                    };
                }

                existingPrevSearch.push(currentQuery);

                localStorage.setItem(
                    'prevSearch',
                    JSON.stringify(existingPrevSearch)
                );
            }

            this.emitSearchParams();
        }

        this.resetSearch();

        if (this.overlayRef) {
            this.overlayRef.detach();
        }

    }

    /**
     * clear the whole list of search
     */
    resetSearch(): void {
        if (this.displayPhonePanel) {
            this.searchInputMobile.nativeElement.blur();
            this.togglePhonePanel();
        } else {
            this.searchPanelFocus = false;
            this.searchInput.nativeElement.blur();
        }
        if (this.overlayRef) {
            this.overlayRef.detach();
        }

    }

    /**
     * set the focus on the search panel
     */
    setFocus(): void {
        if (localStorage.getItem('prevSearch') !== null) {
            this.prevSearch = this._sortingService.reverseArray(JSON.parse(localStorage.getItem('prevSearch')));
        } else {
            this.prevSearch = [];
        }

        if(!this.displayPhonePanel) {
            this.searchPanelFocus = true;
            this.openPanelWithBackdrop();
        }
    }

    /**
     * perform a search with a selected search item from the search history
     * @params prevSearch
     */
    doPrevSearch(prevSearch: PrevSearchItem): void {
        this.searchQuery = prevSearch.query;

        if (prevSearch.projectIri !== undefined) {
            this.projectIri = prevSearch.projectIri;
            this.projectLabel = prevSearch.projectLabel;
        } else {
            this.projectIri = undefined;
            this.projectLabel = this.defaultProjectLabel;
        }
        this.emitSearchParams();

        this.resetSearch();

        if (this.overlayRef) {
            this.overlayRef.detach();
        }
    }

    /**
     * remove one search item from the search history
     * @params prevSearchItem
     */
    resetPrevSearch(prevSearchItem?: PrevSearchItem): void {
        if (prevSearchItem) {
            // delete only this item with the name
            const i: number = this.prevSearch.indexOf(prevSearchItem);
            this.prevSearch.splice(i, 1);
            localStorage.setItem('prevSearch', JSON.stringify(this.prevSearch));
        } else {
            // delete the whole "previous search" array
            localStorage.removeItem('prevSearch');
        }

        if (localStorage.getItem('prevSearch') === null) {
            this.prevSearch = [];
        }
    }

    /**
     * change the focus on the search input field
     */
    changeFocus() {
        this.selectProject.closeMenu();
        this.searchInput.nativeElement.focus();
        this.setFocus();
    }

    emitSearchParams() {
        const searchParams: SearchParams = {
            query: this.searchQuery,
            mode: 'fulltext'
        };

        if (this.projectIri !== undefined) {
            searchParams.filter = {
                limitToProject: this.projectIri
            };
        }

        this.search.emit(searchParams);
    }

    togglePhonePanel() {
        this.displayPhonePanel = !this.displayPhonePanel;
    }

}
