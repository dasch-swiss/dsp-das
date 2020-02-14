import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConnection } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule } from '@knora/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { TestConfig } from 'test.config';
import { BoardComponent } from './board.component';

describe('BoardComponent', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    // let projectSpy: jasmine.Spy;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BoardComponent],
            imports: [
                KuiActionModule,
                KuiCoreModule,
                MatChipsModule,
                MatDialogModule,
                MatDividerModule,
                MatIconModule,
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
                AppInitService,
                {
                    provide: KnoraApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });


    // mock localStorage
    beforeEach(() => {
        let store = {};

        spyOn(localStorage, 'getItem').and.callFake(
            (key: string): string => {
                return store[key] || null;
            }
        );
        spyOn(localStorage, 'removeItem').and.callFake(
            (key: string): void => {
                delete store[key];
            }
        );
        spyOn(localStorage, 'setItem').and.callFake(
            (key: string, value: string): string => {
                return (store[key] = <any>value);
            }
        );
        spyOn(localStorage, 'clear').and.callFake(() => {
            store = {};
        });
    });

    beforeEach(() => {
        localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    /*  beforeEach(inject([KnoraApiConnectionToken], (knoraApiConn) => {
         projectSpy = spyOn(knoraApiConn.admin.projectsEndpoint, 'getProjectByShortcode').withArgs(TestConfig.ProjectCode).and.callFake(
             () => {
                 const projectByShortcode = {
                     body: {
                         project: [
                             {
                                 id: 'http://rdfh.ch/projects/0001',
                                 description: [
                                     {
                                         value: 'Anything Project'
                                     }
                                 ],
                                 keywords: [],
                                 logo: null,
                                 longname: 'Anything Project',
                                 ontologies: [
                                     'http://www.knora.org/ontology/0001/anything',
                                     'http://www.knora.org/ontology/0001/minimal',
                                     'http://www.knora.org/ontology/0001/something'
                                 ],
                                 selfjoin: false,
                                 shortcode: '0001',
                                 shortname: 'anything',
                                 status: true
                             }
                         ]
                     }
                 };
 
                 return of(projectByShortcode);
             });

     })); */

    it('should create', () => {
        expect<any>(localStorage.getItem('session')).toBe(
            JSON.stringify(TestConfig.CurrentSession)
        );
        expect(component).toBeTruthy();

    });

    it('should get projet by shortcode', () => {
        expect(component).toBeTruthy();
        expect(component.projectcode).toEqual('0001');

    });

});
