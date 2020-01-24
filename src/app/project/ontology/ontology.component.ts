import { Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ProjectResponse, ReadProject } from '@knora/api';
import { ApiServiceError, ApiServiceResult, KnoraApiConnectionToken, OntologyService, Session } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { DefaultSourceType, SourceTypes } from './default-data/source-types';


export interface OntologyInfo {
    id: string;
    label: string;
    project: string;
    graph?: any[];
}

@Component({
    selector: 'app-ontology',
    templateUrl: './ontology.component.html',
    styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnInit {

    // loading for progess indicator
    loading: boolean;

    loadOntology: boolean;

    // permissions of logged-in user
    session: Session;
    sysAdmin: boolean = false;
    projectAdmin: boolean = false;

    // project shortcode; as identifier in project cache service
    projectcode: string;

    // project data
    project: ReadProject;

    // ontologies
    ontologies: OntologyInfo[];

    // ontology JSON-LD object
    ontology: any;

    // selected ontology
    ontologyIri: string = undefined;

    // form to select ontology from list
    ontologyForm: FormGroup;

    // i18n setup
    itemPluralMapping = {
        ontology: {
            // '=0': '0 Ontologies',
            '=1': '1 data model',
            other: '# data models'
        }
    };

    /**
     * list of all default source types (sub class of)
     */
    sourceTypes: DefaultSourceType[] = SourceTypes.data;

    @ViewChild('ontologyEditor', { read: ViewContainerRef, static: false }) ontologyEditor: ViewContainerRef;

    // @ViewChild(AddToDirective, { static: false }) addToHost: AddToDirective;

    // @ViewChild('addSourceTypeComponent', { static: false }) addSourceType: AddSourceTypeComponent;

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _ontologyService: OntologyService,
        private _cache: CacheService,
        private _dialog: MatDialog,
        private _fb: FormBuilder,
        private _titleService: Title,
        private _route: ActivatedRoute,
        private _router: Router) {

        // get the shortcode of the current project
        this._route.parent.paramMap.subscribe((params: Params) => {
            this.projectcode = params.get('shortcode');
        });

        // get ontology iri from route
        if (this._route.snapshot && this._route.snapshot.params.id) {
            this.ontologyIri = decodeURIComponent(this._route.snapshot.params.id);
        }

        // set the page title
        if (this.ontologyIri) {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Data model');
        } else {
            this._titleService.setTitle('Project ' + this.projectcode + ' | Data models');
        }
    }

    ngOnInit() {
        this.loading = true;

        // get information about the logged-in user
        this.session = JSON.parse(localStorage.getItem('session'));
        // is the logged-in user system admin?
        this.sysAdmin = this.session.user.sysAdmin;

        // default value for projectAdmin
        this.projectAdmin = this.sysAdmin;

        // set the cache
        this._cache.get(this.projectcode, this.knoraApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode));

        // get the project data from cache
        this._cache.get(this.projectcode, this.knoraApiConnection.admin.projectsEndpoint.getProjectByShortcode(this.projectcode)).subscribe(
            (response: ApiResponseData<ProjectResponse>) => {
                this.project = response.body.project;

                // is logged-in user projectAdmin?
                this.projectAdmin = this.sysAdmin ? this.sysAdmin : this.session.user.projectAdmin.some(e => e === this.project.id);

                // get the ontologies for this project
                this.initList();

                this.ontologyForm = this._fb.group({
                    ontology: new FormControl({
                        value: this.ontologyIri, disabled: false
                    })
                });

                this.loading = false;

                this.ontologyForm.valueChanges
                    .subscribe(data => this.onValueChanged(data));

            },
            (error: ApiResponseError) => {
                console.error(error);
                this.loading = false;
            }
        );
    }

    /**
     * build the list of ontologies
     */
    initList(): void {

        this.loading = true;

        this._ontologyService.getProjectOntologies(encodeURI(this.project.id)).subscribe(
            (ontologies: ApiServiceResult) => {

                if (ontologies.body['@graph'] && ontologies.body['@graph'].length > 0) {

                    this.ontologies = [];

                    for (const ontology of ontologies.body['@graph']) {
                        const info: OntologyInfo = {
                            id: ontology['@id'],
                            label: ontology['rdfs:label'],
                            project: ontology['knora-api:attachedToProject']['@id']
                        };

                        this.ontologies.push(info);
                    }

                    this.loading = false;

                } else if (ontologies.body['@id'] && ontologies.body['rdfs:label']) {
                    // only one ontology
                    this.ontologies = [
                        {
                            id: ontologies.body['@id'],
                            label: ontologies.body['rdfs:label'],
                            project: ontologies.body['knora-api:attachedToProject']['@id']
                        }
                    ];

                    this.ontologyIri = ontologies.body['@id'];

                    // console.log('ontology id from main comp', this.ontologyIri)
                    this.resetOntology(this.ontologyIri);

                    this.loading = false;
                } else {
                    // none ontology defined yet
                    this.ontologies = [];
                    this.loading = false;
                }

                if (this.ontologyIri !== undefined) {
                    this.openOntology(this.ontologyIri);
                }
            },
            (error: ApiServiceError) => {
                console.error(error);
            }
        );
    }

    // update view after selecting an ontology from dropdown
    onValueChanged(data?: any) {

        if (!this.ontologyForm) {
            return;
        }

        this.resetOntology(data.ontology);

    }

    // open ontology by iri
    openOntology(id: string) {

        if (!id) {
            return;
        }

        const goto = 'project/' + this.projectcode + '/ontologies/' + encodeURIComponent(id);
        this._router.navigateByUrl(goto, { skipLocationChange: false });

        // this._router.navigateByUrl('/refresh', { skipLocationChange: true }).then(
        //     () => this._router.navigate([goto])
        // );


        this.loadOntology = true;

        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(id));
        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(id)).subscribe(
            (ontologyResponse: any) => {

                this.ontology = ontologyResponse.body;
                this.ontologyIri = ontologyResponse.body['@id'];

                // select graphs of type owl:Class ( = resource classes only)

                // could be used in the json-ld converter
                // at the moment it's used in filter pipe
                /*
                for (const g of ontologyResponse.body['@graph']) {
                    if (g['@type'] === 'owl:Class') {
                        graph.push(g);
                    }
                }
                */

                setTimeout(() => {
                    this.loadOntology = false;
                });
            },
            (error: any) => {
                // console.error(error);
            }
        );

    }

    // addResourceType(id: string) {
    //     console.log(id);
    //     // this.ontologyEditor.nativeElement.insertAdjacentHTML('beforeend', ``);
    //     // this.appendComponentToBody(SelectListComponent);
    // }

    // loadComponent() {
    //     const componentFactory = this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);
    //     // this._componentFactoryResolver.resolveComponentFactory(ResourceTypeComponent);

    //     // const viewContainerRef = this.ontologyEditor.
    //     // viewContainerRef.clear();

    //     this.ontologyEditor.createComponent(componentFactory);
    // }


    resetOntology(id: string) {
        this.loadOntology = true;

        this._cache.del('currentOntology');
        this.openOntology(id);

        // TODO: get id: does it work after adding new ontology?
    }

    filterOwlClass(owlClass: any) {
        console.log(owlClass);
        return (owlClass['@type'] === 'owl:class');
    }

    openOntologyForm(mode: string, name?: string, iri?: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '640px',
            position: {
                top: '112px'
            },
            data: { mode: mode, title: name, id: iri, project: this.project.shortcode }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(() => {
            // update the view
            this.initList();
        });
    }

    openSourceTypeForm(mode: string, type: DefaultSourceType): void {
        const dialogConfig: MatDialogConfig = {
            width: '720px',
            maxHeight: '90vh',
            position: {
                top: '112px'
            },
            data: { name: type.name, title: type.label, subtitle: 'Customize source type', mode: mode }
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(result => {
            // update the view
            this.resetOntology(this.ontologyIri);
        });
    }

    deleteOntology(id: string) {

        let name: string;
        let iri: string;
        let lastModificationDate: string;

        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(this.ontologyIri)).subscribe(
            (response: any) => {
                name = response.body['rdfs:label'];
                iri = response.body['@id'];
                lastModificationDate = response.body['knora-api:lastModificationDate'];
            },
            (error: any) => {
                console.error(error);
            }
        );
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            position: {
                top: '112px'
            },
            data: { mode: 'deleteOntology', title: name }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(answer => {
            if (answer === true) {
                // delete ontology and refresh the view
                this.loading = true;
                this.ontology = undefined;

                this._ontologyService.deleteOntology(iri, lastModificationDate).subscribe(
                    (response: any) => {
                        // get the ontologies for this project
                        const goto = 'project/' + this.projectcode + '/ontologies/';
                        this._router.navigateByUrl(goto, { skipLocationChange: true });
                        this.initList();
                        this.loading = false;
                    },
                    (error: ApiServiceError) => {
                        // TODO: show message
                        console.error(error);
                        this.loading = false;
                    }
                );

            }
        });

    }

    deleteSourceType(id: string, name: string) {

        let iri: string;
        let lastModificationDate: string;

        this._cache.get('currentOntology', this._ontologyService.getAllEntityDefinitionsForOntologies(this.ontologyIri)).subscribe(
            (response: any) => {
                iri = response.body['@id'] + '#' + id.split(':')[1];
                lastModificationDate = response.body['knora-api:lastModificationDate'];
            },
            (error: any) => {
                console.error(error);
            }
        );

        const dialogConfig: MatDialogConfig = {
            width: '560px',
            position: {
                top: '112px'
            },
            data: { mode: 'deleteSourceType', title: name }
        };

        const dialogRef = this._dialog.open(
            DialogComponent,
            dialogConfig
        );

        dialogRef.afterClosed().subscribe(answer => {
            if (answer === true) {
                // delete resource type and refresh the view
                this.loadOntology = true;

                this._ontologyService.deleteResourceClass(iri, lastModificationDate).subscribe(
                    (response: any) => {
                        this.resetOntology(this.ontologyIri);
                        this.loadOntology = false;
                    },
                    (error: ApiServiceError) => {
                        // TODO: show message
                        console.error(error);
                        this.loadOntology = false;
                    }
                );

            }
        });
    }


}
