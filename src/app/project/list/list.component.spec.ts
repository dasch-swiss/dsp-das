import { HttpClientModule } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, KnoraApiConnection, ListNodeInfo, ListNodeInfoResponse, ListResponse, ListsEndpointAdmin, ListsResponse, MockProjects, ProjectResponse, ProjectsEndpointAdmin, ReadProject, StoredProject, UserResponse } from '@dasch-swiss/dsp-js';
import {
    AppInitService,
    DspActionModule,
    DspApiConfigToken,
    DspApiConnectionToken,
    DspCoreModule,
    Session,
    SessionService
} from '@dasch-swiss/dsp-ui';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogHeaderComponent } from 'src/app/main/dialog/dialog-header/dialog-header.component';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { ListComponent } from './list.component';

/**
 * Test Host Component
 */
@Component({
    template: `<app-list #listComponent></app-list>`
})
class TestHostComponent {
    @ViewChild('listComponent') listComponent: ListComponent;
}

/**
 * Mock ListItem.
 */
@Component({
    template: `<app-list-item></app-list-item>`
})
class MockListItemComponent { }

/**
 * Mock ListItemForm.
 */
@Component({
    template: `<app-list-item-form></app-list-item-form>`
})
class MockListItemFormComponent { }

fdescribe('ListComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {

        const dspConnSpyObj = {
            admin: {
                listsEndpoint: jasmine.createSpyObj('listsEndpoint', ['getListsInProject', 'deleteListNode']),
                projectsEndpoint: jasmine.createSpyObj('projectsEndpoint', ['getProjectByShortcode'])
            }
        };

        const sessionServiceSpy = jasmine.createSpyObj('SessionService', ['getSession']);

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

        TestBed.configureTestingModule({
            declarations: [
                ListComponent,
                TestHostComponent,
                MockListItemComponent,
                MockListItemFormComponent,
                DialogComponent,
                DialogHeaderComponent,
                ErrorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                DspActionModule,
                DspCoreModule,
                HttpClientModule,
                MatButtonModule,
                MatChipsModule,
                MatDialogModule,
                MatFormFieldModule,
                MatIconModule,
                MatMenuModule,
                MatSelectModule,
                MatToolbarModule,
                MatTooltipModule,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            paramMap: of({
                                get: (param: string) => {
                                    if (param === 'shortcode') {
                                        return TestConfig.ProjectCode;
                                    }
                                }
                            })
                        }
                    }
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpyObj
                },
                {
                    provide: SessionService,
                    useValue: sessionServiceSpy
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {}
                },
                {
                    provide: MatDialogRef,
                    useValue: {}
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
    }));

    beforeEach(() => {

        const sessionSpy = TestBed.inject(SessionService);

        (sessionSpy as jasmine.SpyObj<SessionService>).getSession.and.callFake(
            () => {
                const session: Session = {
                    id: 12345,
                    user: {
                        name: 'username',
                        jwt: 'myToken',
                        lang: 'en',
                        sysAdmin: true,
                        projectAdmin: []
                    }
                };

                return session;
            }
        );

        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ProjectResponse = new ProjectResponse();

                const mockProjects = MockProjects.mockProjects();

                response.project = mockProjects.body.projects[0];

                return of(ApiResponseData.fromAjaxResponse({response} as AjaxResponse));
            }
        );

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).getListsInProject.and.callFake(
            () => {
                const response = new ListsResponse();

                response.lists = new Array<ListNodeInfo>();

                const mockList1 = new ListNodeInfo();
                mockList1.comments = [];
                mockList1.id = 'http://rdfh.ch/lists/0001/mockList01';
                mockList1.isRootNode = true;
                mockList1.labels = [{language: 'en', value: 'Mock List 01'}];
                mockList1.projectIri = 'http://rdfh.ch/projects/myProjectIri';

                const mockList2 = new ListNodeInfo();
                mockList2.comments = [];
                mockList2.id = 'http://rdfh.ch/lists/0001/mockList02';
                mockList2.isRootNode = true;
                mockList2.labels = [{language: 'en', value: 'Mock List 02'}];
                mockList2.projectIri = 'http://rdfh.ch/projects/myProjectIri';

                response.lists.push(mockList1, mockList2);

                return of(ApiResponseData.fromAjaxResponse({response} as AjaxResponse));
            }
        );

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjectByShortcode.and.callFake(
            () => {
                const response = new ProjectResponse();

                const mockProjects = MockProjects.mockProjects();

                response.project = mockProjects.body.projects[0];

                return of(ApiResponseData.fromAjaxResponse({response} as AjaxResponse));
            }
        );
    });

    it('should create', () => {
        expect(testHostComponent.listComponent.session).toBeTruthy();
        expect(testHostComponent).toBeTruthy();
    });
});
