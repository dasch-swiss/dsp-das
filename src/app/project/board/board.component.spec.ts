import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConnection, Project } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule, Session } from '@knora/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { TestConfig } from 'test.config';
import { BoardComponent } from './board.component';
import { MatDividerModule } from '@angular/material';
import { CacheService } from 'src/app/main/cache/cache.service';

fdescribe('BoardComponent', () => {
    let component: BoardComponent;
    let fixture: ComponentFixture<BoardComponent>;
    let cacheService: any;
    // let cacheServiceStub: Partial<CacheService>;

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
                /* {
                    provide: CacheService,
                    useValue: cacheServiceStub
                }, */
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

       // cacheService = fixture.debugElement.injector.get(CacheService);

        fixture = TestBed.createComponent(BoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    fit('should create', () => {
        expect<any>(localStorage.getItem('session')).toBe(
            JSON.stringify(TestConfig.CurrentSession)
        );
        expect(component).toBeTruthy();
    });

    // todo: find a way to mock the cacheService
    /* fit('should get projet by shortcode', inject([KnoraApiConnectionToken], (knoraApiConn) => {
        cacheService.set(TestConfig.ProjectCode, knoraApiConn.admin.projectsEndpoint.getProjectByShortcode(TestConfig.ProjectCode));
        const project = cacheService.get(TestConfig.ProjectCode, knoraApiConn.admin.projectsEndpoint.getProjectByShortcode(TestConfig.ProjectCode));

        console.log(project);
    })); */

    // todo: check the project name, if there is description and keywords, check if we can edit the project info if the user is project admin or system admin (edit btn displayed)
    // check if you get the project by shortcode

    // todo: set up another describe() with the SystemAdminSession and test the same tests
});
