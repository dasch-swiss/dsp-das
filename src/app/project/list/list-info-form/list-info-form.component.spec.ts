import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientModule } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, CreateListRequest, ListInfoResponse, ListResponse, ListsEndpointAdmin, UpdateListInfoRequest } from '@dasch-swiss/dsp-js';
import {
    DspActionModule,
    DspApiConnectionToken,
    DspCoreModule
} from '@dasch-swiss/dsp-ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';
import { DialogHeaderComponent } from 'src/app/main/dialog/dialog-header/dialog-header.component';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { ListInfoFormComponent } from './list-info-form.component';

/**
 * test host component to simulate parent component for creating a new list.
 */
@Component({
    template: '<app-list-info-form #listInfoForm [iri]="iri" [mode]="mode" [projectIri]="projectIri"></app-list-info-form>'
})
class TestHostUpdateListComponent {

    @ViewChild('listInfoForm') listInfoForm: ListInfoFormComponent;

    iri = 'http://rdfh.ch/lists/0001/otherTreeList';

    mode = 'update';

    projectIri = 'http://rdfh.ch/projects/0001';

    constructor() {}
}

/**
 * test host component to simulate parent component for creating a new list.
 */
@Component({
    template: '<app-list-info-form #listInfoForm [mode]="mode" [projectCode]="projectCode" [projectIri]="projectIri"></app-list-info-form>'
})
class TestHostCreateListComponent {

    @ViewChild('listInfoForm') listInfoForm: ListInfoFormComponent;

    mode = 'create';

    projectCode = '0001';

    projectIri = 'http://rdfh.ch/projects/0001';

    constructor() {}
}

describe('ListInfoFormComponent', () => {
    let testHostUpdateListComponent: TestHostUpdateListComponent;
    let testHostUpdateListFixture: ComponentFixture<TestHostUpdateListComponent>;
    let testHostCreateListComponent: TestHostCreateListComponent;
    let testHostCreateListFixture: ComponentFixture<TestHostCreateListComponent>;
    let rootLoader: HarnessLoader;

    const listsEndpointSpyObj = {
        admin: {
            listsEndpoint: jasmine.createSpyObj('listsEndpoint', ['getListInfo', 'updateListInfo', 'createList'])
        }
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestHostUpdateListComponent,
                TestHostCreateListComponent,
                ListInfoFormComponent,
                DialogComponent,
                DialogHeaderComponent,
                ErrorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                HttpClientModule,
                DspActionModule,
                DspCoreModule,
                MatIconModule,
                MatInputModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: listsEndpointSpyObj
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {}
                },
                {
                    provide: MatDialogRef,
                    useValue: {}
                }
            ]
        })
            .compileComponents();
    }));

    describe('update existing list info', () => {
        beforeEach(() => {

            const listsEndpointSpy = TestBed.inject(DspApiConnectionToken);

            (listsEndpointSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).getListInfo.and.callFake(
                () => {
                    const response = new ListInfoResponse();
                    response.listinfo.id = 'http://rdfh.ch/lists/0001/otherTreeList';
                    response.listinfo.labels = [{ 'value': 'Other Tree List', 'language': 'en' }];
                    response.listinfo.comments = [{ 'value': 'Other Tree List comment', 'language': 'en' }];
                    return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
                }
            );

            testHostUpdateListFixture = TestBed.createComponent(TestHostUpdateListComponent);
            testHostUpdateListComponent = testHostUpdateListFixture.componentInstance;
            testHostUpdateListFixture.detectChanges();
            expect(testHostUpdateListComponent).toBeTruthy();

            rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostUpdateListFixture);
        });

        it('should instantiate arrays for labels and comments', () => {
            expect(testHostUpdateListComponent.listInfoForm.labels).toEqual([{ 'value': 'Other Tree List', 'language': 'en' }]);
            expect(testHostUpdateListComponent.listInfoForm.comments).toEqual([{ 'value': 'Other Tree List comment', 'language': 'en' }]);
        });

        it('should display "Update" as the submit button text and be disabled as long as no labels are provided', async () => {
            const submitButton = await rootLoader.getHarness(MatButtonHarness.with({ selector: '.list-submit' }));

            expect(await submitButton.getText()).toEqual('Update');

            expect(await submitButton.isDisabled()).toBeFalsy();

            testHostUpdateListComponent.listInfoForm.handleData([], 'labels');

            expect(await submitButton.isDisabled()).toBeTruthy();

            testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');

            expect(await submitButton.isDisabled()).toBeFalsy();
        });

        it('should update labels when the value changes', () => {
            testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');
            expect(testHostUpdateListComponent.listInfoForm.labels).toEqual([{ 'value': 'My edited list label', 'language': 'en' }]);
        });

        it('should update comments when the value changes', () => {
            testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list comment', 'language': 'en' }], 'comments');
            expect(testHostUpdateListComponent.listInfoForm.comments).toEqual([{ 'value': 'My edited list comment', 'language': 'en' }]);
        });

        it('should update the list info', () => {
            const listsEndpointSpy = TestBed.inject(DspApiConnectionToken);

            testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list label', 'language': 'en' }], 'labels');
            testHostUpdateListComponent.listInfoForm.handleData([{ 'value': 'My edited list comment', 'language': 'en' }], 'comments');

            const updateListInfoRequest: UpdateListInfoRequest = new UpdateListInfoRequest();
            updateListInfoRequest.listIri = testHostUpdateListComponent.listInfoForm.iri;
            updateListInfoRequest.projectIri = testHostUpdateListComponent.listInfoForm.projectIri;
            updateListInfoRequest.labels = testHostUpdateListComponent.listInfoForm.labels;
            updateListInfoRequest.comments = testHostUpdateListComponent.listInfoForm.comments;

            (listsEndpointSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).updateListInfo.and.callFake(
                () => {
                    const response = new ListInfoResponse();
                    response.listinfo.labels = [{ 'value': 'My edited list label', 'language': 'en' }];
                    response.listinfo.comments = [{ 'value': 'My edited list comment', 'language': 'en' }];

                    expect(updateListInfoRequest.labels).toEqual(response.listinfo.labels);
                    expect(updateListInfoRequest.comments).toEqual(response.listinfo.comments);

                    return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
                }
            );

            testHostUpdateListComponent.listInfoForm.submitData();
            expect(listsEndpointSpy.admin.listsEndpoint.updateListInfo).toHaveBeenCalledTimes(1);
            expect(listsEndpointSpy.admin.listsEndpoint.updateListInfo).toHaveBeenCalledWith(updateListInfoRequest);
        });
    });

    describe('create new list', () => {
        beforeEach(() => {
            testHostCreateListFixture = TestBed.createComponent(TestHostCreateListComponent);
            testHostCreateListComponent = testHostCreateListFixture.componentInstance;
            testHostCreateListFixture.detectChanges();
            expect(testHostCreateListComponent).toBeTruthy();

            rootLoader = TestbedHarnessEnvironment.documentRootLoader(testHostCreateListFixture);
        });

        it('should instantiate empty arrays for labels and comments', () => {
            expect(testHostCreateListComponent.listInfoForm.labels).toEqual([]);
            expect(testHostCreateListComponent.listInfoForm.comments).toEqual([]);
        });

        it('should display "Create" as the submit button text and be disabled as long as no labels are provided', async () => {
            const submitButton = await rootLoader.getHarness(MatButtonHarness.with({ selector: '.list-submit' }));

            expect(await submitButton.getText()).toEqual('Create');

            expect(await submitButton.isDisabled()).toBeTruthy();

            testHostCreateListComponent.listInfoForm.handleData([{ 'value': 'My new list', 'language': 'en' }], 'labels');

            expect(await submitButton.isDisabled()).toBeFalsy();

            testHostCreateListComponent.listInfoForm.handleData([], 'labels');

            expect(await submitButton.isDisabled()).toBeTruthy();
        });

        it('should create a new list', () => {
            const listsEndpointSpy = TestBed.inject(DspApiConnectionToken);

            testHostCreateListComponent.listInfoForm.handleData([{ 'value': 'My new list', 'language': 'en' }], 'labels');
            testHostCreateListComponent.listInfoForm.handleData([{ 'value': 'My new list comment', 'language': 'en' }], 'comments');

            const createListRequest: CreateListRequest = new CreateListRequest();
            createListRequest.projectIri = testHostCreateListComponent.listInfoForm.projectIri;
            createListRequest.labels = testHostCreateListComponent.listInfoForm.labels;
            createListRequest.comments = testHostCreateListComponent.listInfoForm.comments;

            (listsEndpointSpy.admin.listsEndpoint as jasmine.SpyObj<ListsEndpointAdmin>).createList.and.callFake(
                () => {
                    const response = new ListResponse();
                    response.list.children = [];
                    response.list.listinfo.labels = [{ 'value': 'My new list', 'language': 'en' }];
                    response.list.listinfo.comments = [{ 'value': 'My new list comment', 'language': 'en' }];

                    expect(createListRequest.labels).toEqual(response.list.listinfo.labels);
                    expect(createListRequest.comments).toEqual(response.list.listinfo.comments);

                    return of(ApiResponseData.fromAjaxResponse({ response } as AjaxResponse));
                }
            );

            testHostCreateListComponent.listInfoForm.submitData();
            expect(listsEndpointSpy.admin.listsEndpoint.createList).toHaveBeenCalledTimes(1);
            expect(listsEndpointSpy.admin.listsEndpoint.createList).toHaveBeenCalledWith(createListRequest);
        });
    });

});
