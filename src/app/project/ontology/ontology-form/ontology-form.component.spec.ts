import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection, MockOntology, MockProjects, ReadOntology, ReadProject } from '@dasch-swiss/dsp-js';
import {
    AppInitService,
    DspActionModule,
    DspApiConfigToken,
    DspApiConnectionToken,
    DspCoreModule
} from '@dasch-swiss/dsp-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { OntologyFormComponent } from './ontology-form.component';

/**
 * test host component to simulate parent component for updating an existing ontology.
 */
@Component({
    template: '<app-ontology-form #ontologyFormEle [iri]="iri" [projectcode]="projectcode" [projectIri]="projectIri"></app-ontology-form>'
})
class TestHostUpdateOntologyComponent {

    @ViewChild('ontologyFormEle') ontologyFormEle: OntologyFormComponent;

    iri = 'http://0.0.0.0:3333/ontology/0001/anything/v2';
    projectcode = '0001';
    existingOntologyNames = ['anything', 'minimal', 'something'];

    constructor() { }
}

/**
 * test host component to simulate parent component for creating a new ontology.
 */
@Component({
    template: '<app-ontology-form #ontologyFormEle [projectcode]="projectcode" [projectIri]="projectIri"></app-ontology-form>'
})
class TestHostCreateOntologyComponent {

    @ViewChild('ontologyFormEle') ontologyFormEle: OntologyFormComponent;

    projectcode = '0001';
    existingOntologyNames = ['anything', 'minimal', 'something'];

    constructor() { }
}

fdescribe('OntologyFormComponent', () => {
    let testHostUpdateOntologyComponent: TestHostUpdateOntologyComponent;
    let testHostUpdateOntologyFixture: ComponentFixture<TestHostUpdateOntologyComponent>;
    let testHostCreateOntologyComponent: TestHostCreateOntologyComponent;
    let testHostCreateOntologyFixture: ComponentFixture<TestHostCreateOntologyComponent>;

    let ontologyFormComponent: OntologyFormComponent;
    let ontologyFormFixture: ComponentFixture<OntologyFormComponent>;

    let rootLoader: HarnessLoader;

    const formBuilder: FormBuilder = new FormBuilder();

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestHostUpdateOntologyComponent,
                TestHostCreateOntologyComponent,
                OntologyFormComponent,
                DialogComponent,
                ErrorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                DspActionModule,
                DspCoreModule,
                HttpClientTestingModule,
                MatFormFieldModule,
                MatInputModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ],
            providers: [
                // reference the new instance of formBuilder from above
                { provide: FormBuilder, useValue: formBuilder },
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
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
        // mock cache service for currentOntology
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response = MockProjects.mockProject();
                return of(response);
            }
        );

        ontologyFormFixture = TestBed.createComponent(OntologyFormComponent);
        ontologyFormComponent = ontologyFormFixture.componentInstance;
        ontologyFormComponent.projectcode = '00FF';
        // ontologyFormComponent.iri = 'http://0.0.0.0:3333/ontology/0001/anything/v2';
        ontologyFormComponent.existingOntologyNames = ['images'];

        ontologyFormComponent.ngOnInit();
        ontologyFormFixture.detectChanges();
    });


    it('should create', () => {
        expect(ontologyFormComponent).toBeTruthy();
    });

    it('should render input elements', () => {
        const compiled = ontologyFormFixture.debugElement;
        const nameInput = compiled.query(By.css('.ontology-name input'));
        const labelInput = compiled.query(By.css('.ontology-label input'));
        const commentInput = compiled.query(By.css('.ontology-comment textarea'));

        expect(nameInput).toBeTruthy();
        expect(labelInput).toBeTruthy();
        expect(commentInput).toBeTruthy();
    });

    it('should test form validity with allowed name', () => {
        const form = ontologyFormComponent.ontologyForm;
        expect(form.valid).toBeFalsy();

        const nameInput = form.controls.name;
        nameInput.setValue('biblio');

        expect(form.valid).toBeTruthy();
    });

    it('should test form validity with forbidden names', () => {
        const form = ontologyFormComponent.ontologyForm;
        expect(form.valid).toBeFalsy();

        const nameInput = form.controls.name;

        nameInput.setValue('ontology');
        expect(form.valid).toBeFalsy();

        nameInput.setValue('images');
        expect(form.valid).toBeFalsy();

    });

    it('should test form validity without label', () => {
        const form = ontologyFormComponent.ontologyForm;
        expect(form.valid).toBeFalsy();

        const nameInput = form.controls.name;
        const labelInput = form.controls.label;

        nameInput.setValue('biblio');

        const compiled = ontologyFormFixture.debugElement;
        expect(ontologyFormComponent.ontologyLabel).toEqual('Biblio');
        expect(form.valid).toBeTruthy();


        labelInput.setValue('Biblio Ontology');
        expect(ontologyFormComponent.ontologyForm.controls.label.value).toEqual('Biblio Ontology');
        expect(form.valid).toBeTruthy();

    });


    // describe('create new ontology', () => {
        // beforeEach(() => {

        //     // mock cache service for currentOntology
        //     const cacheSpy = TestBed.inject(CacheService);

        //     (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
        //         () => {
        //             const response: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
        //             return of(response);
        //         }
        //     );

        //     testHostUpdateOntologyFixture = TestBed.createComponent(TestHostUpdateOntologyComponent);
        //     testHostUpdateOntologyComponent = testHostUpdateOntologyFixture.componentInstance;
        //     testHostUpdateOntologyFixture.detectChanges();
        //     expect(testHostUpdateOntologyComponent).toBeTruthy();

        //     rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostUpdateOntologyFixture);
        // });

        // it('should instantiate label and comment', () => {
        //     expect(testHostUpdateOntologyComponent.ontologyFormEle.ontologyForm.controls.label.value).toEqual('The anything ontology');
        //     expect(testHostUpdateOntologyComponent.ontologyFormEle.ontologyForm.controls.comment.value).toEqual(undefined);
        // });

        // it('should display "Update" as the submit button text and be disabled as long as no labels are provided', async () => {
        //     const submitButton = await rootLoader.getHarness(MatButtonHarness.with({ selector: '.list-submit' }));

        //     expect(await submitButton.getText()).toEqual('Update');

        //     expect(await submitButton.isDisabled()).toBeFalsy();

        //     testHostUpdateListComponent.listInfoForm.handleData([], 'labels');

        //     expect(await submitButton.isDisabled()).toBeTruthy();

        //     testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');

        //     expect(await submitButton.isDisabled()).toBeFalsy();
        // });

        // it('should update labels when the value changes', () => {
        //     testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');
        //     expect(testHostUpdateListComponent.listInfoForm.labels).toEqual([{ 'value': 'My edited list label', 'language': 'en' }]);
        // });

        // it('should update comments when the value changes', () => {
        //     testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list comment', 'language': 'en' }], 'comments');
        //     expect(testHostUpdateListComponent.listInfoForm.comments).toEqual([{ 'value': 'My edited list comment', 'language': 'en' }]);
        // });

        // it('should update the list info', () => {
        //     const listsEndpointSpy = TestBed.inject(DspApiConnectionToken);

        //     testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');
        //     testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list comment', 'language': 'en' }], 'comments');

        //     const updateListInfoRequest: UpdateListInfoRequest = new UpdateListInfoRequest();
        //     updateListInfoRequest.listIri = testHostUpdateListComponent.listInfoForm.iri;
        //     updateListInfoRequest.projectIri = testHostUpdateListComponent.listInfoForm.projectIri;
        //     updateListInfoRequest.labels = testHostUpdateListComponent.listInfoForm.labels;
        //     updateListInfoRequest.comments = testHostUpdateListComponent.listInfoForm.comments;

        //     (listsEndpointSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).updateListInfo.and.callFake(
        //         () => {
        //             const response = new ListInfoResponse();
        //             response.listinfo.labels = [{ 'value': 'My edited list label', 'language': 'en' }];
        //             response.listinfo.comments = [{ 'value': 'My edited list comment', 'language': 'en' }];

        //             expect(updateListInfoRequest.labels).toEqual(response.listinfo.labels);
        //             expect(updateListInfoRequest.comments).toEqual(response.listinfo.comments);

        //             return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
        //         }
        //     );

        //     testHostUpdateListComponent.listInfoForm.submitData();
        //     expect(listsEndpointSpy.admin.listsEndpoint.updateListInfo).toHaveBeenCalledTimes(1);
        //     expect(listsEndpointSpy.admin.listsEndpoint.updateListInfo).toHaveBeenCalledWith(updateListInfoRequest);
        // });
    // });

});
