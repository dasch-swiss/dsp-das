import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProjects, MockUsers, ProjectsEndpointAdmin, StoredProject, UsersEndpointAdmin } from '@dasch-swiss/dsp-js';
import { AppInitService } from 'src/app/app-init.service';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConfigToken, DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { TestConfig } from 'test.config';
import { of } from 'rxjs';
import { OverviewComponent } from './overview.component';
import { Component, Input, ViewChild } from '@angular/core';
import { ProjectTileComponent } from 'src/app/system/project-tile/project-tile.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

/**
 * test host component to simulate parent component as a logged in user.
 */
@Component({
    template: `
    <app-overview #overview></app-overview>`
})
class TestHostOverviewComponent {

    @ViewChild('overview') overviewComp: OverviewComponent;
}

/**
 * test component to simulate project tile component.
 */
@Component({
    selector: 'app-project-tile',
    template: ''
})
class TestProjectTileComponent {

    @ViewChild('projectTile') projectTileComp: ProjectTileComponent;

    @Input() project: StoredProject;
    @Input() sysAdmin: Boolean;
}

describe('OverviewComponent', () => {

    beforeEach(async () => {
        const dspConnSpy = {
            admin: {
                usersEndpoint: jasmine.createSpyObj('usersEndpoint', ['getUserByUsername']),
                projectsEndpoint: jasmine.createSpyObj('projectsEndpoint', ['getProjects'])
            }
        };
        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get', 'set']);

        await TestBed.configureTestingModule({
            declarations: [
                OverviewComponent,
                TestHostOverviewComponent,
                TestProjectTileComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatButtonModule,
                MatChipsModule,
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                MatSnackBarModule,
                RouterTestingModule
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                }
            ]
        })
            .compileComponents();
    });

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

    describe('Logged in user', () => {
        let testHostComponent: TestHostOverviewComponent;
        let testHostFixture: ComponentFixture<TestHostOverviewComponent>;

        beforeEach(() => {
            localStorage.removeItem('session');

            // mock getProjects response
            const dspConnSpy = TestBed.inject(DspApiConnectionToken);

            (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjects.and.callFake(
                () => {
                    const projects = MockProjects.mockProjects();
                    return of(projects);
                }
            );

            (dspConnSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>).getUserByUsername.and.callFake(
                () => {
                    const loggedInUser = MockUsers.mockUser();

                    // recreate anything project
                    const anythingProj = new StoredProject();
                    anythingProj.id = 'http://rdfh.ch/projects/Lw3FC39BSzCwvmdOaTyLqQ';
                    anythingProj.longname = 'Anything Project';
                    anythingProj.shortcode = '0001';
                    anythingProj.keywords = ['arbitrary test data', 'things'];
                    anythingProj.shortname = 'anything';
                    anythingProj.status = true;

                    // add project to list of users projects
                    loggedInUser.body.user.projects = [anythingProj];
                    return of(loggedInUser);
                }
            );

            const session = TestConfig.CurrentSession;
            session.user.sysAdmin = false;

            localStorage.setItem('session', JSON.stringify(session));

            expect<any>(localStorage.getItem('session')).toBe(
                JSON.stringify(TestConfig.CurrentSession)
            );

            testHostFixture = TestBed.createComponent(TestHostOverviewComponent);
            testHostComponent = testHostFixture.componentInstance;
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
        });

        it('should populate project lists correctly', () => {
            expect(testHostComponent.overviewComp.userProjects.length).toEqual(1);
            expect(testHostComponent.overviewComp.otherProjects.length).toEqual(7);
        });
    });

    describe('Admin', () => {
        let testHostComponent: TestHostOverviewComponent;
        let testHostFixture: ComponentFixture<TestHostOverviewComponent>;
        let rootLoader: HarnessLoader;
        let overlayContainer: OverlayContainer;

        beforeEach(() => {
            localStorage.removeItem('session');

            // mock getProjects response
            const dspConnSpy = TestBed.inject(DspApiConnectionToken);

            (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjects.and.callFake(
                () => {
                    const projects = MockProjects.mockProjects();
                    return of(projects);
                }
            );

            const session = TestConfig.CurrentSession;
            session.user.sysAdmin = true;

            localStorage.setItem('session', JSON.stringify(session));

            expect<any>(localStorage.getItem('session')).toBe(
                JSON.stringify(session)
            );

            testHostFixture = TestBed.createComponent(TestHostOverviewComponent);
            testHostComponent = testHostFixture.componentInstance;
            overlayContainer = TestBed.inject(OverlayContainer);
            rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostFixture);
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
        });

        afterEach(async () => {
            const dialogs = await rootLoader.getAllHarnesses(MatDialogHarness);
            await Promise.all(dialogs.map(async d => await d.close()));

            // angular won't call this for us so we need to do it ourselves to avoid leaks.
            overlayContainer.ngOnDestroy();
        });

        it('should populate project lists correctly', () => {
            expect(testHostComponent.overviewComp.userProjects.length).toEqual(0);
            expect(testHostComponent.overviewComp.otherProjects.length).toEqual(8);
        });

        it('should show the "Create new project" button', async () => {
            // grab the 'Create new project' button
            const createNewProjBtn = await rootLoader.getAllHarnesses(MatButtonHarness.with({ selector: '.create-project-button button' }));

            // 'Create new project' button should be found by above method
            expect(createNewProjBtn.length).toEqual(1);
        });

        it('should open the "Create new project" popup', async () => {
            // grab the 'Create new project' button
            const createNewProjBtn = await rootLoader.getHarness(MatButtonHarness.with({ selector: '.create-project-button button' }));

            await createNewProjBtn.click();

            // get dialog harness
            const dialogHarnesses = await rootLoader.getAllHarnesses(MatDialogHarness);

            expect(dialogHarnesses.length).toEqual(1);
        });
    });

    describe('Unknown user (logged out)', () => {
        let testHostComponent: TestHostOverviewComponent;
        let testHostFixture: ComponentFixture<TestHostOverviewComponent>;
        let rootLoader: HarnessLoader;

        beforeEach(() => {
            localStorage.removeItem('session');

            // mock getProjects response
            const dspConnSpy = TestBed.inject(DspApiConnectionToken);

            (dspConnSpy.admin.projectsEndpoint as jasmine.SpyObj<ProjectsEndpointAdmin>).getProjects.and.callFake(
                () => {
                    const projects = MockProjects.mockProjects();
                    return of(projects);
                }
            );

            testHostFixture = TestBed.createComponent(TestHostOverviewComponent);
            testHostComponent = testHostFixture.componentInstance;
            rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostFixture);
            testHostFixture.detectChanges();

            expect(testHostComponent).toBeTruthy();
        });

        it('should populate project lists correctly', () => {
            expect(testHostComponent.overviewComp.userProjects.length).toEqual(0);
            expect(testHostComponent.overviewComp.otherProjects.length).toEqual(7);
        });

        it('should NOT show the "Create new project" button', async () => {
            // attempt to grab the 'Create new project' button
            const createNewProjBtn = await rootLoader.getAllHarnesses(MatButtonHarness.with({ selector: '.create-project-button button' }));

            // 'Create new project' button should NOT be found by above method
            expect(createNewProjBtn.length).toEqual(0);
        });
    });

});
