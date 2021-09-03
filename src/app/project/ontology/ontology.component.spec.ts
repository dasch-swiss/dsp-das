import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, CanDoResponse, ListNodeInfo, ListsEndpointAdmin, ListsResponse, MockList, MockOntology, OntologiesEndpointV2, OntologiesMetadata, ReadOntology } from '@dasch-swiss/dsp-js';
import {
    DspActionModule, DspApiConnectionToken,
    DspCoreModule
} from '@dasch-swiss/dsp-ui';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { OntologyVisualizerComponent } from './ontology-visualizer/ontology-visualizer.component';
import { OntologyComponent } from './ontology.component';
import { PropertyInfoComponent } from './property-info/property-info.component';
import { ResourceClassInfoComponent } from './resource-class-info/resource-class-info.component';

describe('OntologyComponent', () => {
    let component: OntologyComponent;
    let fixture: ComponentFixture<OntologyComponent>;

    beforeEach(waitForAsync(() => {
        const ontologyEndpointSpyObj = {
            admin: {
                listsEndpoint: jasmine.createSpyObj('listsEndpoint', ['getListsInProject'])
            },
            v2: {
                onto: jasmine.createSpyObj('onto', [
                    'getOntologiesByProjectIri',
                    'getOntology',
                    'canDeleteOntology',
                    'deleteOntology',
                    'deleteResourceClass',
                    'deleteResourceProperty'
                ])
            }
        };

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set']);

        TestBed.configureTestingModule({
            declarations: [
                OntologyComponent,
                OntologyVisualizerComponent,
                DialogComponent,
                ErrorComponent,
                PropertyInfoComponent,
                ResourceClassInfoComponent
            ],
            imports: [
                BrowserAnimationsModule,
                DspActionModule,
                DspCoreModule,
                HttpClientTestingModule,
                MatCardModule,
                MatDialogModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatMenuModule,
                MatOptionModule,
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
                    useValue: ontologyEndpointSpyObj
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                }
            ]
        })
            .compileComponents();
    }));

    // mock localStorage
    beforeEach(() => {
        let store = {};

        spyOn(localStorage, 'getItem').and.callFake(
            (key: string): string => store[key] || null
        );
        spyOn(localStorage, 'removeItem').and.callFake(
            (key: string): void => {
                delete store[key];
            }
        );
        spyOn(localStorage, 'setItem').and.callFake(
            (key: string, value: string): string => (store[key] = <any>value)
        );
        spyOn(localStorage, 'clear').and.callFake(() => {
            store = {};
        });
    });

    beforeEach(() => {
        // set local storage session data
        localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

        // set cache with current ontology
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
                return of(response);
            }
        );

        // can delete ontology request
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);
        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).canDeleteOntology.and.callFake(
            () => {
                const deleteResClass: CanDoResponse = {
                    'canDo': false
                };

                return of(deleteResClass);
            }
        );

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntologiesByProjectIri.and.callFake(
            () => {
                const response: OntologiesMetadata = MockOntology.mockOntologiesMetadata();
                return of(response);
            }
        );

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntology.and.callFake(
            () => {
                const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
                return of(response);
            }
        );

        (dspConnSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).getListsInProject.and.callFake(
            () => {
                const response = new ListsResponse();

                response.lists = new Array<ListNodeInfo>();

                const mockList1 = new ListNodeInfo();
                mockList1.comments = [];
                mockList1.id = 'http://rdfh.ch/lists/0001/mockList01';
                mockList1.isRootNode = true;
                mockList1.labels = [{ language: 'en', value: 'Mock List 01' }];
                mockList1.projectIri = 'http://rdfh.ch/projects/myProjectIri';

                const mockList2 = new ListNodeInfo();
                mockList2.comments = [];
                mockList2.id = 'http://rdfh.ch/lists/0001/mockList02';
                mockList2.isRootNode = true;
                mockList2.labels = [{ language: 'en', value: 'Mock List 02' }];
                mockList2.projectIri = 'http://rdfh.ch/projects/myProjectIri';

                response.lists.push(mockList1, mockList2);

                return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
            }
        );


        fixture = TestBed.createComponent(OntologyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect<any>(localStorage.getItem('session')).toBe(
            JSON.stringify(TestConfig.CurrentSession)
        );
        expect(component).toBeTruthy();
    });
});
