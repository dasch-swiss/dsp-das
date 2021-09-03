import { Component, DebugElement, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
    ApiResponseData,
    Constants,
    CreateLinkValue,
    CreateResource,
    MockProjects,
    MockResource,
    MockUsers,
    ReadResource, ResourcesEndpointV2,
    StoredProject,
    UserResponse,
    UsersEndpointAdmin
} from '@dasch-swiss/dsp-js';
import { DspActionModule, FilteredResources } from '@dasch-swiss/dsp-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { Session, SessionService } from 'src/app/main/services/session.service';
import { ResourceLinkFormComponent } from './resource-link-form.component';

const resolvedPromise = Promise.resolve(null);

/**
 * test host component to simulate parent component.
 */
@Component({
    template: `
        <app-resource-link-form #resourceLinkFormComp [resources]="resources"></app-resource-link-form>`
})
class TestHostComponent implements OnInit {

    @ViewChild('resourceLinkFormComp') resourceLinkFormComponent: ResourceLinkFormComponent;

    resources: FilteredResources = {
        'count': 3,
        'resListIndex': [3, 2, 1],
        'resInfo': [
            {
                'id': 'http://rdfh.ch/0803/83616f8d8501',
                'label': '65r'
            },
            {
                'id': 'http://rdfh.ch/0803/71e0b9958a01',
                'label': '76r'
            },
            {
                'id': 'http://rdfh.ch/0803/683d5cd26f01',
                'label': '17v'
            },
        ],
        'selectionType': 'multiple'
    };

    constructor() { }

    ngOnInit() {
    }

}

/**
 * mock select-project component to use in tests.
 */
@Component({
    selector: 'app-select-project'
})
class MockSelectProjectComponent implements OnInit {
    @Input() formGroup: FormGroup;
    @Input() usersProjects: StoredProject[];
    @Output() projectSelected = new EventEmitter<string>();

    form: FormGroup;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit() {
        this.form = this._fb.group({
            projects: [null, Validators.required]
        });

        resolvedPromise.then(() => {
            // add form to the parent form group
            this.formGroup.addControl('projects', this.form);
        });
    }
}

describe('ResourceLinkFormComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;
    let resourceLinkFormComponentDe: DebugElement;

    beforeEach(waitForAsync(() => {
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
                ResourceLinkFormComponent,
                TestHostComponent,
                MockSelectProjectComponent
            ],
            imports: [
                BrowserAnimationsModule,
                DspActionModule,
                MatButtonModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatSelectModule,
                MatSnackBarModule,
                MatTooltipModule,
                ReactiveFormsModule,
                RouterTestingModule,
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

                return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
            }
        );

        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>).getUserByUsername.and.callFake(
            () => {
                const loggedInUser = MockUsers.mockUser();
                return of(loggedInUser);
            }
        );

        const hostCompDe = testHostFixture.debugElement;

        resourceLinkFormComponentDe = hostCompDe.query(By.directive(ResourceLinkFormComponent));

    });


    it('should initialize the usersProjects array', () => {
        expect(testHostComponent.resourceLinkFormComponent.usersProjects.length).toEqual(1);
    });


    it('should show the select project component', () => {

        const comp = resourceLinkFormComponentDe.query(By.directive(MockSelectProjectComponent));

        expect((comp.componentInstance as MockSelectProjectComponent).usersProjects.length).toEqual(1);
    });

    it('should submit the form', () => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.res as jasmine.SpyObj<ResourcesEndpointV2>).createResource.and.callFake(
            () => {
                let resource = new ReadResource();

                MockResource.getTestThing().subscribe((res) => {
                    resource = res;
                });

                return of(resource);
            }
        );

        testHostComponent.resourceLinkFormComponent.form.controls['label'].setValue('My Label');

        testHostFixture.detectChanges();

        const props = {};
        const createVal: CreateLinkValue[] = [];
        // res 1
        testHostComponent.resources.resInfo.forEach(res => {
            const linkVal = new CreateLinkValue();
            linkVal.linkedResourceIri = res.id;
            linkVal.type = Constants.LinkValue;
            createVal.push(linkVal);
        });

        props[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue'] = createVal;

        const expectedCreateResource = new CreateResource();
        expectedCreateResource.label = 'My Label';
        expectedCreateResource.type = Constants.KnoraApiV2 + Constants.HashDelimiter + 'LinkObj';
        expectedCreateResource.properties = props;

        // --> TODO create a Router spy to mock the navigation
        testHostComponent.resourceLinkFormComponent.submitData();

        expect(dspConnSpy.v2.res.createResource).toHaveBeenCalledTimes(1);


    });

});
