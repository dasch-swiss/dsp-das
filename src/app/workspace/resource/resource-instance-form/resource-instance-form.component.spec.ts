import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, DebugElement, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, MockOntology, MockProjects, MockUsers, OntologiesEndpointV2, OntologiesMetadata, ReadOntology, ResourceClassDefinition, StoredProject, UserResponse, UsersEndpointAdmin } from '@dasch-swiss/dsp-js';
import { OntologyCache } from '@dasch-swiss/dsp-js/src/cache/ontology-cache/OntologyCache';
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
    @Output() projectSelected = new EventEmitter<string>();

    form: FormGroup;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit() {
        this.form = this._fb.group({
            projects: [null, Validators.required]
        });
    }
}

/**
 * Mock select-ontology component to use in tests.
 */
@Component({
    selector: `app-select-ontology`
})
class MockSelectOntologyComponent implements OnInit {
    @Input() formGroup: FormGroup;
    @Input() ontologiesMetadata: OntologiesMetadata;
    @Output() ontologySelected = new EventEmitter<string>();

    form: FormGroup;

    constructor(@Inject(FormBuilder) private _fb: FormBuilder) { }

    ngOnInit() {
        this.form = this._fb.group({
            projects: [null, Validators.required]
        });
    }
}

/**
 * Mock select-resource-class component to use in tests.
 */
@Component({
    selector: `app-select-resource-class`
})
class MockSelectResourceClassComponent implements OnInit {
    @Input() formGroup: FormGroup;
    @Input() resourceClassDefinitions: ResourceClassDefinition[];

    label: string;
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
                MockSelectProjectComponent,
                MockSelectOntologyComponent,
                MockSelectResourceClassComponent
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
                return of(loggedInUser);
            }
        );

        const hostCompDe = testHostFixture.debugElement;

        resourceInstanceFormComponentDe = hostCompDe.query(By.directive(ResourceInstanceFormComponent));
    });

    it('should initialize the usersProjects array', () => {
        expect(testHostComponent.resourceInstanceFormComponent.usersProjects.length).toEqual(1);
    });

    it('should show the select project component', () => {

        const comp = resourceInstanceFormComponentDe.query(By.directive(MockSelectProjectComponent));

        expect((comp.componentInstance as MockSelectProjectComponent).usersProjects.length).toEqual(1);
    });

    it('should show the select ontology component', () => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntologiesByProjectIri.and.callFake(
            () => {
                const anythingOnto = MockOntology.mockOntologiesMetadata();
                return of(anythingOnto);
            }
        );

        const selectProjectComp = resourceInstanceFormComponentDe.query(By.directive(MockSelectProjectComponent));

        (selectProjectComp.componentInstance as MockSelectProjectComponent).projectSelected.emit('http://0.0.0.0:3333/ontology/0001/anything/v2');

        testHostFixture.detectChanges();

        const selectOntoComp = resourceInstanceFormComponentDe.query(By.directive(MockSelectOntologyComponent));

        expect((selectOntoComp.componentInstance as MockSelectOntologyComponent).ontologiesMetadata.ontologies.length).toEqual(10);

        expect(dspConnSpy.v2.onto.getOntologiesByProjectIri).toHaveBeenCalledTimes(1);
    });

    it('should show the select resource class component', () => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.ontologyCache as jasmine.SpyObj<OntologyCache>).getOntology.and.callFake(
            () => {

                const anythingOnto = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');

                const ontoMap: Map<string, ReadOntology> = new Map();

                ontoMap.set('http://0.0.0.0:3333/ontology/0001/anything/v2', anythingOnto);

                return of(ontoMap);
            }
        );

        testHostComponent.resourceInstanceFormComponent.ontologiesMetadata = MockOntology.mockOntologiesMetadata();

        testHostFixture.detectChanges();

        const selectOntoComp = resourceInstanceFormComponentDe.query(By.directive(MockSelectOntologyComponent));

        (selectOntoComp.componentInstance as MockSelectOntologyComponent).ontologySelected.emit('http://0.0.0.0:3333/ontology/0001/anything/v2');

        testHostFixture.detectChanges();

        const selectResourceClassComp = resourceInstanceFormComponentDe.query(By.directive(MockSelectResourceClassComponent));

        expect((selectResourceClassComp.componentInstance as MockSelectResourceClassComponent).resourceClassDefinitions.length).toEqual(8);
    });
});
