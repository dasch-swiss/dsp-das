import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, ClassDefinition, MockOntology, MockProjects, OntologiesEndpointV2, ProjectResponse, ProjectsEndpointAdmin, ReadOntology, ReadProject } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { AppInitService } from '../app-init.service';
import { CacheService } from '../main/cache/cache.service';
import { DspApiConnectionToken } from '../main/declarations/dsp-api-tokens';
import { DialogComponent } from '../main/dialog/dialog.component';
import { StatusComponent } from '../main/status/status.component';
import { OntologyService } from './ontology/ontology.service';
import { ProjectComponent } from './project.component';

@Component({
    selector: `app-ontology-classes`
})
class MockOntologyClassesComponent {
    @Input() resClasses: ClassDefinition[];
    @Input() projectMember: boolean;
}

@Component({
    selector: 'app-progress-indicator',
    template: ''
})
class MockProgressIndicatorComponent {}

@Component ({
    template: `<app-project #project></app-project>`
})
class TestHostProjectComponent {
    @ViewChild('project') projectComp: ProjectComponent;
}

describe('ProjectComponent', () => {
    let component: TestHostProjectComponent;
    let fixture: ComponentFixture<TestHostProjectComponent>;

    const appInitSpy = {
        dspAppConfig: {
            iriBase: 'http://rdfh.ch'
        }
    };

    beforeEach(waitForAsync(() => {

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set', 'has']);
        const dspConnSpyObj = {
            admin: {
                projectsEndpoint: jasmine.createSpyObj('projectsEndpoint', ['getProjectByIri'])
            },
            v2: {
                onto: jasmine.createSpyObj('onto', ['getOntologiesByProjectIri', 'getOntology']),
            }
        };
        const ontoServiceSpy = jasmine.createSpyObj('OntologyService', ['getOntologyName']);

        TestBed.configureTestingModule({
            declarations: [
                TestHostProjectComponent,
                ProjectComponent,
                DialogComponent,
                StatusComponent,
                MockOntologyClassesComponent,
                MockProgressIndicatorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatDialogModule,
                MatDividerModule,
                MatExpansionModule,
                MatIconModule,
                MatListModule,
                MatSidenavModule,
                MatSnackBarModule,
                MatTabsModule,
                MatTooltipModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: AppInitService,
                    useValue: appInitSpy
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpyObj
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                },
                {
                    provide: OntologyService,
                    useValue: ontoServiceSpy
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            url: [
                                { path: 'project' }
                            ],
                            params: [
                                { uuid: '00123001' }
                            ]
                        }
                    }
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        // mock cache service
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ProjectResponse = new ProjectResponse();

                const mockProjects = MockProjects.mockProjects();

                response.project = mockProjects.body.projects[0];

                return of(response.project as ReadProject);
            }
        );

        // mock API
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        // mock projects endpoint
        (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjectByIri.and.callFake(
            () => {
                const response = new ProjectResponse();

                const mockProjects = MockProjects.mockProjects();

                response.project = mockProjects.body.projects[0];

                return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
            }
        );

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntologiesByProjectIri.and.callFake(
            () => {
                const anythingOnto = MockOntology.mockOntologiesMetadata();
                return of(anythingOnto);
            }
        );

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntology.and.callFake(
            () => {
                const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
                return of(response);
            }
        );

        fixture = TestBed.createComponent(TestHostProjectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // todo: check title, check if we get the shortcode of the current project and valide it, check if get session, get project by shortcode, check if the user is logged in as
    // system admin or project admin
});
