import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, DebugElement, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, MockProjects, MockUsers, StoredProject, UserResponse, UsersEndpointAdmin } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, Session, SessionService } from '@dasch-swiss/dsp-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { CacheService } from 'src/app/main/cache/cache.service';
import { ResourceInstanceFormComponent } from './resource-instance-form.component';
import { SelectProjectComponent } from './select-project/select-project.component';


/**
 * Test host component to simulate parent component.
 */
@Component({
    template: `
        <app-resource-instance-form #resourceInstanceFormComp></app-resource-instance-form>`
})
class TestHostComponent implements OnInit {

    @ViewChild('resourceInstanceFormComp') resourceInstanceFormComponent: ResourceInstanceFormComponent;

    constructor() {}

    ngOnInit() {
    }

}

/**
 * Mock select-project component to use in tests.
 */
@Component({
    selector: `app-select-project`
})
class MockSelectProjectComponent implements OnInit {
    @Input() formGroup: FormGroup;
    @Input() usersProjects: StoredProject[];

    form: FormGroup;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit() {
        this.form = this._fb.group({
            projects: [null, Validators.required]
        });
    }
}

describe('ResourceInstanceFormComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;
    let resourceInstanceFormComponentDe: DebugElement;
    let loader: HarnessLoader;

    beforeEach(async(() => {
        const dspConnSpy = {
            admin: {
                usersEndpoint: jasmine.createSpyObj('usersEndpoint', ['getUserByUsername'])
            },
            v2: {
                onto: jasmine.createSpyObj('onto', ['getOntologiesByProjectIri']),
                ontologyCache: jasmine.createSpyObj('ontologyCache', ['getOntology', 'getResourceClassDefinition']),
                res: jasmine.createSpyObj('res', ['createResource'])
            }
        };

        const sessionServiceSpy = jasmine.createSpyObj('SessionService', ['getSession']);

        const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

        TestBed.configureTestingModule({
            declarations: [
                ResourceInstanceFormComponent,
                TestHostComponent,
                MockSelectProjectComponent
            ],
            imports: [
                RouterTestingModule,
                ReactiveFormsModule,
                MatSelectModule,
                MatOptionModule,
                BrowserAnimationsModule,
                TranslateModule.forRoot()
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy
                },
                {
                    provide: SessionService,
                    useValue: sessionServiceSpy
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                }
            ]
        })
        .compileComponents();

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
                        sysAdmin: false,
                        projectAdmin: []
                    }
                };

                return session;
            }
        );

        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: UserResponse = new UserResponse();

                const project = MockProjects.mockProject();

                response.user.projects = new Array<StoredProject>();

                response.user.projects.push(project.body.project);

                return of(ApiResponseData.fromAjaxResponse({response} as AjaxResponse));
            }
        );

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(testHostFixture);
        testHostFixture.detectChanges();

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>).getUserByUsername.and.callFake(
            () => {
                const loggedInUser = MockUsers.mockUser();
                console.log(loggedInUser);
                return of(loggedInUser);
            }
        );

        const hostCompDe = testHostFixture.debugElement;

        resourceInstanceFormComponentDe = hostCompDe.query(By.directive(ResourceInstanceFormComponent));
    });

    it('should initialize the usersProjects array', () => {
        expect(testHostComponent.resourceInstanceFormComponent.usersProjects.length).toEqual(1);
    });

    it('should show the select properties component', async () => {

        console.log(resourceInstanceFormComponentDe);

        const comp = resourceInstanceFormComponentDe.query(By.directive(MockSelectProjectComponent));

        expect((comp.componentInstance as MockSelectProjectComponent).usersProjects.length).toEqual(1);
    });
});
