import { Component, Input, ViewChild } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
    ApiResponseData,
    MockUsers,
    ReadUser,
    UserResponse,
    UsersEndpointAdmin,
    UsersResponse,
} from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { AppConfigService } from '@dasch-swiss/vre/shared/app-config';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { StatusComponent } from '@dsp-app/src/app/main/status/status.component';
import { UsersComponent } from './users.component';

/**
 * test Host Component
 */
@Component({
    template: '<app-users #usersComponent></app-users>',
})
class TestHostComponent {
    @ViewChild('usersComponent') usersComponent: UsersComponent;
}

/**
 * mock users list Component
 */
@Component({
    selector: 'app-users-list',
    template: '',
})
class MockUsersListComponent {
    // list of users: status active or inactive (deleted)
    @Input() status: boolean;

    // list of users: depending on the parent
    @Input() list: ReadUser[];

    // enable the button to create new user
    @Input() createNew = false;
}

describe('UsersComponent', () => {
    let testHostcomponent: TestHostComponent;
    let testHostfixture: ComponentFixture<TestHostComponent>;

    const apiSpyObj = {
        admin: {
            usersEndpoint: jasmine.createSpyObj('usersEndpoint', [
                'getUserByIri',
                'getUsers',
            ]),
        },
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                UsersComponent,
                TestHostComponent,
                MockUsersListComponent,
                DialogComponent,
                StatusComponent,
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
                RouterTestingModule,
            ],
            providers: [
                AppConfigService,
                {
                    provide: DspApiConnectionToken,
                    useValue: apiSpyObj,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);
        (
            dspConnSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>
        ).getUsers.and.callFake(() => {
            const allUsers: ApiResponseData<UsersResponse> =
                MockUsers.mockUsers();
            return of(allUsers);
        });

        (
            dspConnSpy.admin.usersEndpoint as jasmine.SpyObj<UsersEndpointAdmin>
        ).getUserByIri.and.callFake(() => {
            const user: ApiResponseData<UserResponse> = MockUsers.mockUser();
            return of(user);
        });

        testHostfixture = TestBed.createComponent(TestHostComponent);
        testHostcomponent = testHostfixture.componentInstance;
        testHostfixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostcomponent).toBeTruthy();
    });

    // todo: should get the list of users (active and deactivated), should create a new user, should add/remove a user as system admin
    // should add/remove a user in a project
});
