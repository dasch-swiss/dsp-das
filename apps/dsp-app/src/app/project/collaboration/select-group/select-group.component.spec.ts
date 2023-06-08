import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, GroupsEndpointAdmin, GroupsResponse, ReadGroup } from '@dasch-swiss/dsp-js';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import {  DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { StatusComponent } from '@dsp-app/src/app/main/status/status.component';
import { SelectGroupComponent } from './select-group.component';
import { of } from 'rxjs';
import { AjaxResponse } from 'rxjs/ajax';

describe('SelectGroupComponent', () => {
    let component: SelectGroupComponent;
    let fixture: ComponentFixture<SelectGroupComponent>;

    const appInitSpy = {
        dspAppConfig: {
            iriBase: 'http://rdfh.ch',
        },
    };

    beforeEach(waitForAsync(() => {

        const dspConnSpyObj = {
            admin: {
                groupsEndpoint: jasmine.createSpyObj('groupsEndpoint', [
                    'getGroups',
                ]),
            },
        };

        TestBed.configureTestingModule({
            declarations: [
                SelectGroupComponent,
                DialogComponent,
                StatusComponent,
            ],
            imports: [
                BrowserAnimationsModule,
                MatDialogModule,
                MatFormFieldModule,
                MatSelectModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                RouterTestingModule,
            ],
            providers: [
                {
                    provide: AppConfigService,
                    useValue: appInitSpy,
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpyObj,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        // mock API
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.admin.groupsEndpoint as jasmine.SpyObj<GroupsEndpointAdmin>).getGroups.and.callFake(
            () => {
                const response = new GroupsResponse();

                const groups = [new ReadGroup()];

                response.groups = groups;

                return of(
                    ApiResponseData.fromAjaxResponse({ response } as AjaxResponse)
                );
            }
        )
        fixture = TestBed.createComponent(SelectGroupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // todo: check if we get the list of groups
});
