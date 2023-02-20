import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OntologiesEndpointV2, MockOntology, ApiResponseData, ListNodeInfo, ListsEndpointAdmin, ListsResponse } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { AppInitService } from 'src/app/app-init.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { StringifyStringLiteralPipe } from 'src/app/main/pipes/string-transformation/stringify-string-literal.pipe';
import { OntologyService } from '../ontology/ontology.service';

import { DataModelsComponent } from './data-models.component';

@Component({
    template: `<app-data-models #dataModels></app-data-models>`
})
class DataModelsTestHostComponent {
    @ViewChild('dataModels') dataModelsComp: DataModelsComponent;
}

describe('DataModelsComponent', () => {
    let component: DataModelsTestHostComponent;
    let fixture: ComponentFixture<DataModelsTestHostComponent>;

    const appInitSpy = {
        dspAppConfig: {
            iriBase: 'http://rdfh.ch'
        }
    };

    beforeEach(async () => {
        const dspConnSpyObj = {
            admin: {
                listsEndpoint: jasmine.createSpyObj('listsEndpoint', ['getListsInProject'])
            },
            v2: {
                onto: jasmine.createSpyObj('onto', ['getOntologiesByProjectIri']),
            }
        };

        const ontoServiceSpy = jasmine.createSpyObj('OntologyService', ['getOntologyName']);

        await TestBed.configureTestingModule({
            declarations: [
                DataModelsTestHostComponent,
                DataModelsComponent,
                StringifyStringLiteralPipe
            ],
            imports: [
                MatDialogModule,
                MatIconModule,
                MatSnackBarModule,
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
                    provide: OntologyService,
                    useValue: ontoServiceSpy
                },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
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
                }
            ]
        }).compileComponents();

        // mock API
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntologiesByProjectIri.and.callFake(
            () => {
                const anythingOnto = MockOntology.mockOntologiesMetadata();
                return of(anythingOnto);
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

        fixture = TestBed.createComponent(DataModelsTestHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should list the projects data models', () => {
        const dataModels = fixture.debugElement.queryAll(By.css('.projectOntos .list .list-item'));
        expect(dataModels.length).toEqual(15);
    });

    it('should list the projects lists', () => {
        const dataModels = fixture.debugElement.queryAll(By.css('.projectLists .list .list-item'));
        expect(dataModels.length).toEqual(2);
    });
});
