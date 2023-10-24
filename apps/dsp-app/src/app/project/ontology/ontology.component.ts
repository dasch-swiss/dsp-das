import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostListener,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
    ApiResponseError,
    ClassDefinition,
    Constants,
    DeleteResourceClass,
    DeleteResourceProperty,
    KnoraApiConnection,
    PropertyDefinition,
    ReadOntology,
    ReadUser,
    UpdateOntology,
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, RouteConstants, getAllEntityDefinitionsAsArray } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { SortingService } from '@dsp-app/src/app/main/services/sorting.service';
import { ProjectService } from '@dsp-app/src/app/workspace/resource/services/project.service';
import {
    DefaultProperties,
    PropertyCategory,
    PropertyInfoObject,
} from './default-data/default-properties';
import {
    DefaultResourceClasses,
} from './default-data/default-resource-classes';
import { OntologyService } from './ontology.service';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { ClearCurrentOntologyAction, CurrentOntologyCanBeDeletedAction, DefaultClass, LoadOntologyAction, LoadProjectOntologiesAction, OntologiesSelectors, OntologyProperties, ProjectsSelectors, RemoveProjectOntologyAction, SetCurrentOntologyAction, SetCurrentProjectOntologyPropertiesAction, SetOntologiesLoadingAction, UpdateProjectOntologyAction, UserSelectors } from '@dasch-swiss/vre/shared/app-state';
import { Observable, Subject, combineLatest } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { ProjectBase } from '../project-base';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-ontology',
    templateUrl: './ontology.component.html',
    styleUrls: ['./ontology.component.scss'],
})
export class OntologyComponent extends ProjectBase implements OnInit, OnDestroy {
    private ngUnsubscribe: Subject<void> = new Subject<void>();
    
    @ViewChild('ontologyEditor', { read: ViewContainerRef })
    ontologyEditor: ViewContainerRef;

    // id of current ontology
    get ontologyIri$(): Observable<string> {
        const iriBase = this._ontologyService.getIriBaseUrl();
        return combineLatest([this._route.params, this.project$])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map(([params, project]) => {
                    const ontologyIri = `${iriBase}/${RouteConstants.ontology}/${project.shortcode}/${params['onto']}/v2`;
                    return ontologyIri;
                })
            );
    }

    // the lastModificationDate is the most important key
    // when updating something inside the ontology
    get lastModificationDate$(): Observable<string> {
        return this.currentOntology$.pipe(
            takeUntil(this.ngUnsubscribe),
            map(x => x?.lastModificationDate)
        );
    };

    // all resource classes in the current ontology
    ontoClasses: ClassDefinition[];
    // expand the resource class cards
    expandClasses = true;

    // all properties in the current ontology
    ontoProperties: OntologyProperties;

    // form to select ontology from list
    ontologyForm: UntypedFormGroup;

    // display resource classes as grid or as graph
    view: 'classes' | 'properties' | 'graph' = 'classes';

    // i18n setup; in the user interface we use the term
    // data model for ontology
    itemPluralMapping = {
        ontology: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '=1': '1 data model',
            other: '# data models',
        },
    };

    /**
     * list of all default resource classes (subclass of)
     */
    defaultClasses: DefaultClass[] = DefaultResourceClasses.data;
    defaultProperties: PropertyCategory[] = DefaultProperties.data;

    // disable content on small devices
    disableContent = false;

    // route to classes view
    classesLink = `../${RouteConstants.classes}`;
    propertiesLink = `../${RouteConstants.properties}`;

    get isAdmin$(): Observable<boolean> {
        return combineLatest([this.user$, this.userProjectAdminGroups$, this._route.parent.params])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map(([user, userProjectGroups, params]) => {
                    return this._projectService.isProjectAdminOrSysAdmin(user, userProjectGroups, params.uuid);
                })
            )
    }
    
    get isLoading$(): Observable<boolean> {
        return combineLatest([this.isOntologiesLoading$, this.isProjectsLoading$])
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map(([isOntologiesLoading, isProjectsLoading]) => {
                    return isOntologiesLoading === true || isProjectsLoading === true;
                })
            )
    }

    @Select(UserSelectors.user) user$: Observable<ReadUser>;
    @Select(UserSelectors.userProjectAdminGroups) userProjectAdminGroups$: Observable<string[]>;
    @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;
    @Select(ProjectsSelectors.isProjectsLoading) isProjectsLoading$: Observable<boolean>;
    @Select(OntologiesSelectors.isLoading) isOntologiesLoading$: Observable<boolean>;
    @Select(OntologiesSelectors.currentProjectOntologies) currentProjectOntologies$: Observable<ReadOntology[]>;
    @Select(OntologiesSelectors.currentOntology) currentOntology$: Observable<ReadOntology>;
    @Select(OntologiesSelectors.currentOntologyCanBeDeleted) currentOntologyCanBeDeleted$: Observable<boolean>;

    constructor(
        @Inject(DspApiConnectionToken)
        private _dspApiConnection: KnoraApiConnection,
        private _dialog: MatDialog,
        private _errorHandler: AppErrorHandler,
        private _fb: UntypedFormBuilder,
        private _ontologyService: OntologyService,
        private _sortingService: SortingService,
        protected _actions$: Actions,
        protected _router: Router,
        protected _route: ActivatedRoute,
        protected _store: Store,
        protected _titleService: Title,
        protected _projectService: ProjectService,
        protected _cd: ChangeDetectorRef,
    ) {
        super(_store, _route, _projectService, _titleService, _router, _cd, _actions$);
    }

    @HostListener('window:resize', ['$event']) onWindowResize() {
        this.disableContent = window.innerWidth <= 768;
        // reset the page title
        if (!this.disableContent) {
            this.setTitle();
        }
    }

    ngOnInit() {
        super.ngOnInit();
        // get the uuid of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectUuid = params.get('uuid');
        });

        if (this._route.snapshot) {
            // get the selected view from route: display classes or properties view
            this.view = this._route.snapshot.params.view
                ? this._route.snapshot.params.view
                : 'classes';
        }
        
        this.initOntology();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this._store.dispatch(new ClearCurrentOntologyAction());
    }

    initView(ontology: ReadOntology): void {
        this.disableContent = window.innerWidth <= 768;

        // set the page title
        this.setTitle();
        //this.initOntologiesList();

        this.ontologyForm = this._fb.group({
            ontology: new UntypedFormControl({
                value: ontology.id,
                disabled: false,
            }),
        });

        this.ontologyForm.valueChanges.subscribe((val) =>
            this.onValueChanged(val.ontology)
        );
    }

    /**
     * build the list of project ontologies
     * and set the state of currentProjectOntologies
     */
    initOntologiesList(): void {
        this._store.dispatch(new LoadProjectOntologiesAction(this.projectUuid));
        combineLatest([this._actions$.pipe(ofActionSuccessful(LoadProjectOntologiesAction)), this.currentProjectOntologies$, this.ontologyIri$])
            .pipe(
                take(1),
                map(([loadProjectOntologiesAction, currentProjectOntologies, ontologyIri]) => {
                    const readOnto = currentProjectOntologies.find((x) => x.id === ontologyIri);
                    if (readOnto) {
                        // one ontology is selected:
                        // get all information to display this ontology
                        // with all classes, properties and connected lists
                        this.resetOntologyView(readOnto);
                    }
                }));
    }

    initOntology() {
        const currentOntology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
        if (!currentOntology) {
            const projectOntologies = this._store.selectSnapshot(OntologiesSelectors.projectOntologies);
            this.ontologyIri$
                .pipe(take(1))
                .subscribe(iri => {
                    const projectIri = this._projectService.uuidToIri(this.projectUuid);
                    const currentOntology = projectOntologies[projectIri]?.readOntologies.find(o => o.id === iri);
                    if (currentOntology) {
                        this.resetOntologyView(currentOntology);
                    } else {
                        this._store.select(OntologiesSelectors.isLoading)
                            .pipe(takeUntil(this.ngUnsubscribe))
                            .subscribe(isLoading => {
                                if (isLoading === false) {
                                    this._store.dispatch(new LoadOntologyAction(iri, this.projectUuid, true));
                                }
                            });
                    } 
                });
        } else {
            this.resetOntologyView(currentOntology);
        }
    }

    initOntoClasses(allOntoClasses: ClassDefinition[]) {
        // reset the ontology classes
        this.ontoClasses = [];

        // display only the classes which are not a subClass of Standoff
        allOntoClasses.forEach((resClass) => {
            if (resClass.subClassOf.length) {
                const splittedSubClass = resClass.subClassOf[0].split('#');
                if (
                    !splittedSubClass[0].includes(Constants.StandoffOntology) &&
                    !splittedSubClass[1].includes('Standoff')
                ) {
                    this.ontoClasses.push(resClass);
                }
            }
        });
        // sort classes by label
        // --> TODO: add sort functionallity to the gui
        this.ontoClasses = this._sortingService.keySortByAlphabetical(this.ontoClasses, 'label');
    }

    initOntoProperties(ontology: ReadOntology, allOntoProperties: PropertyDefinition[]) {
        // reset the ontology properties
        const listOfProperties = [];

        // display only the properties which are not a subjectType of Standoff
        allOntoProperties.forEach((resProp) => {
            const standoff = resProp.subjectType
                ? resProp.subjectType.includes('Standoff')
                : false;
            if (resProp.objectType !== Constants.LinkValue && !standoff) {
                listOfProperties.push(resProp);
            }
        });

        // sort properties by label
        this.ontoProperties = {
            ontology: ontology.id,
            properties: this._sortingService.keySortByAlphabetical(
                listOfProperties,
                'label'
            ),
        };
    }

    /**
     * update view after selecting an ontology from dropdown
     * @param id
     */
    onValueChanged(id: string) {
        if (!this.ontologyForm) {
            return;
        }
        // reset and open selected ontology
        this.resetOntology(id);
    }

    onLastModificationDateChange(lastModificationDate): void {
        const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
        //TODO reload or just update lastModificationDate in the state?
        this._store.dispatch(new LoadOntologyAction(ontology.id, this.projectUuid, true));
    }

    /**
     * opens ontology route by iri
     * @param id ontology id/iri
     * @param view 'classes' | 'properties' | ' graph'
     */
    openOntologyRoute(
        id: string,
        view: 'classes' | 'properties' | 'graph' = 'classes'
    ) {
        this.view = view;

        this._router.navigate([
            RouteConstants.project,
            this.projectUuid,
            RouteConstants.ontologies,
            encodeURIComponent(id),
            view
        ], { skipLocationChange: false });
    }

    /**
     * resets the current view and the selected ontology
     * @param id
     */
    resetOntology(id: string) {
        this._store.dispatch([new SetCurrentOntologyAction(null), new CurrentOntologyCanBeDeletedAction()]);
        this.ontoClasses = [];
        this.openOntologyRoute(id, this.view);
        this.initOntologiesList();
    }

    resetOntologyView(ontology: ReadOntology) {
        this.initView(ontology);
        this._dspApiConnection.v2.ontologyCache.reloadCachedItem(ontology.id);
        // grab the onto class information to display
        this.initOntoClasses(getAllEntityDefinitionsAsArray(ontology.classes));
        // grab the onto properties information to display
        this.initOntoProperties(ontology, getAllEntityDefinitionsAsArray(ontology.properties));

        const projectIri = this._projectService.uuidToIri(this.projectUuid);
        this._store.dispatch([
            new SetCurrentOntologyAction(ontology),
            new SetCurrentProjectOntologyPropertiesAction(projectIri),
            new CurrentOntologyCanBeDeletedAction()
        ]);
    }

    /**
     * filters owl class
     * @param owlClass
     */
    filterOwlClass(owlClass: any) {
        return owlClass['@type'] === 'owl:class';
    }

    /**
     * opens ontology form to create or edit ontology info
     * @param mode
     * @param [iri] only in edit mode
     */
    openOntologyForm(
        mode: 'createOntology' | 'editOntology',
        iri?: string
    ): void {
        const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
        const title = iri ? ontology.label : 'Data model';

        const uuid = this._projectService.iriToUuid(this.projectUuid);
        const existingOntologyNames = this._store.selectSnapshot(OntologiesSelectors.currentProjectExistingOntologyNames);

        const dialogConfig: MatDialogConfig = {
            width: '640px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: {
                mode: mode,
                title: title,
                id: iri,
                project: uuid,
                existing: existingOntologyNames,
            },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((ontologyId: string) => {
            // in case of new ontology, go to correct route and update the view
            if (ontologyId) {
                //this.ontologyIri = ontologyId;
                // reset and open selected ontology
                this.ontologyForm.controls['ontology'].setValue(ontologyId);
            } else {
                this.initOntologiesList();
            }
        });
    }

    /**
     * opens resource class form to create or edit resource class info
     * @param mode
     * @param resClassInfo (could be subClassOf (create mode) or resource class itself (edit mode))
     */
    openResourceClassForm(
        mode: 'createResourceClass' | 'editResourceClass',
        resClassInfo: DefaultClass
    ): void {
        const dialogConfig: MatDialogConfig = {
            width: '640px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: {
                id: resClassInfo.iri,
                title: resClassInfo.label,
                subtitle: 'Customize resource class',
                mode: mode,
            },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(() => {
            // update the view
            this.initOntologiesList();
            // refresh whole page; todo: would be better to use an event emitter to the parent to update the list of resource classes
            window.location.reload();
        });
    }

    /**
     * opens property form to create or edit property info
     * @param mode whether an existing property is assigned or a new one is created
     * @param propertyInfo the property to assign and edit
     */
    openPropertyForm(
        mode: 'createProperty' | 'editProperty',
        propertyInfo: PropertyInfoObject
    ): void {
        const title = propertyInfo.propDef
            ? propertyInfo.propDef.label
            : propertyInfo.propType.group + ': ' + propertyInfo.propType.label;

        const dialogConfig: MatDialogConfig = {
            width: '640px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: {
                propInfo: propertyInfo,
                title: title,
                subtitle: 'Customize property',
                mode: mode,
            },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(() => {
            // get the ontologies for this project
            this.initOntologiesList();
            // update the view of resource class or list of properties
            this.initOntology();
        });
    }

    /**
     * delete either ontology, resource class or property
     *
     * @param mode Can be 'Ontology' or 'ResourceClass'
     * @param info
     */
    delete(
        mode: 'Ontology' | 'ResourceClass' | 'Property',
        info: DefaultClass
    ) {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px',
            },
            data: { mode: 'delete' + mode, title: info.label },
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe((answer) => {
            if (answer === true) {
                const ontology = this._store.selectSnapshot(OntologiesSelectors.currentOntology);
                // delete and refresh the view
                switch (mode) {
                    case 'Ontology':
                        this._store.dispatch(new SetOntologiesLoadingAction(true));
                        const updateOntology = new UpdateOntology();
                        updateOntology.id = ontology.id;
                        updateOntology.lastModificationDate = ontology.lastModificationDate;
                        this._dspApiConnection.v2.onto
                            .deleteOntology(updateOntology)
                            .subscribe(
                                () => {
                                    // reset current ontology
                                    this._store.dispatch([
                                        new SetCurrentOntologyAction(null), 
                                        new RemoveProjectOntologyAction(updateOntology.id, this.projectUuid)
                                    ]);
                                    // get the ontologies for this project
                                    this.initOntologiesList();
                                    // go to project ontology page
                                    const goto = `/project/${this.projectUuid}`;
                                    this._router
                                        .navigateByUrl(goto, {
                                            skipLocationChange: false,
                                        })
                                        .then(() => {
                                            // refresh whole page; todo: would be better to use an event emitter to the parent to update the list of resource classes
                                            window.location.reload();
                                        });
                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                    this._store.dispatch(new SetOntologiesLoadingAction(false));
                                }
                            );
                        break;

                    case 'ResourceClass':
                        // delete resource class and refresh the view
                        this._store.dispatch(new SetOntologiesLoadingAction(true));
                        const resClass: DeleteResourceClass =
                            new DeleteResourceClass();
                        resClass.id = info.iri;
                        resClass.lastModificationDate = ontology.lastModificationDate;
                        this._dspApiConnection.v2.onto
                            .deleteResourceClass(resClass)
                            .subscribe(
                                () => {
                                    this._store.dispatch(new SetOntologiesLoadingAction(false));
                                    // refresh whole page; todo: would be better to use an event emitter to the parent to update the list of resource classes
                                    window.location.reload();
                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                }
                            );
                        break;
                    case 'Property':
                        // delete resource property and refresh the view
                        this._store.dispatch(new SetOntologiesLoadingAction(true));
                        const resProp: DeleteResourceProperty =
                            new DeleteResourceProperty();
                        resProp.id = info.iri;
                        resProp.lastModificationDate = ontology.lastModificationDate;
                        this._dspApiConnection.v2.onto
                            .deleteResourceProperty(resProp)
                            .subscribe(
                                () => {
                                    this._store.dispatch(new SetOntologiesLoadingAction(false));
                                    // get the ontologies for this project
                                    this.initOntologiesList();
                                    // update the view of resource class or list of properties
                                    this.initOntology();
                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                }
                            );
                        break;
                }
            }
        });
    }

    private setTitle() {
        combineLatest([ProjectBase.navigationEndFilter(this._router.events), this.project$, this.currentOntology$])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(([event, project, currentOntology]) => {
                this._titleService.setTitle(`Project ${project.shortname} | Data model ${currentOntology.id ? '' : 's'}`);
            });
    }
    
}
