import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProjects, ProjectResponse, ReadProject } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { StatusComponent } from 'src/app/main/status/status.component';
import { SelectGroupComponent } from 'src/app/project/collaboration/select-group/select-group.component';
import { TestConfig } from 'test.config';
import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
    let component: UsersListComponent;
    let fixture: ComponentFixture<UsersListComponent>;

    const apiSpyObj = {
        admin: {
            usersEndpoint: jasmine.createSpyObj(
                'usersEndpoint', ['getUserGroupMemberships', 'addUserToGroupMembership', 'removeUserFromGroupMembership', 'addUserToProjectAdminMembership', 'updateUserSystemAdminMembership']
            )
        },
    };

    beforeEach(waitForAsync(() => {

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set']);

        TestBed.configureTestingModule({
            declarations: [
                UsersListComponent,
                SelectGroupComponent,
                DialogComponent,
                StatusComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatButtonModule,
                MatChipsModule,
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                MatSelectModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            parent: {
                                paramMap: of({
                                    get: (param: string) => {
                                        if (param === 'uuid') {
                                            return TestConfig.ProjectUuid;
                                        }
                                    }
                                }),
                                snapshot: {
                                    url: []
                                }
                            }
                        }
                    }
                },
                AppInitService,
                {
                    provide: DspApiConnectionToken,
                    useValue: apiSpyObj
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
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
    });

    // mock localStorage
    beforeEach(() => {
        let store = {};

        spyOn(sessionStorage, 'getItem').and.callFake(
            (key: string): string => store[key] || null
        );
        spyOn(sessionStorage, 'removeItem').and.callFake(
            (key: string): void => {
                delete store[key];
            }
        );
        spyOn(sessionStorage, 'setItem').and.callFake(
            (key: string, value: string): string => (store[key] = <any>value)
        );
        spyOn(sessionStorage, 'clear').and.callFake(() => {
            store = {};
        });

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
        localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

        fixture = TestBed.createComponent(UsersListComponent);
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
