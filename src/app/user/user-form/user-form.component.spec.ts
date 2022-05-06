import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiResponseData, KnoraApiConnection, MockUsers, ReadUser, UsersResponse } from '@dasch-swiss/dsp-js';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { PasswordFormComponent } from './password-form/password-form.component';
import { UserFormComponent } from './user-form.component';

describe('UserFormComponent', () => {
    let component: UserFormComponent;
    let fixture: ComponentFixture<UserFormComponent>;

    const cacheServiceSpyUser = jasmine.createSpyObj('CacheServiceUser', ['get']);
    const cacheServiceSpyAllUsers = jasmine.createSpyObj('CacheServiceAllUsers', ['get']);

    const apiSpyObj = {
        admin: {
            usersEndpoint: jasmine.createSpyObj('usersEndpoint', ['getUser', 'getUsers'])
        },
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                UserFormComponent,
                PasswordFormComponent,
                DialogComponent,
                ErrorComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatDialogModule,
                MatIconModule,
                MatInputModule,
                MatSelectModule,
                MatSlideToggleModule,
                MatSnackBarModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConnectionToken,
                    useValue: apiSpyObj
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpyUser
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpyAllUsers
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        localStorage.setItem('session', JSON.stringify(TestConfig.CurrentSession));

        // const cacheSpyUser = TestBed.inject(CacheService);
        // (cacheSpyUser as jasmine.SpyObj<CacheService>).get.withArgs('root').and.callFake(
        //     () => {
        //         const response: ApiResponseData<UserResponse> = MockUsers.mockUser();

        //         return of(response.body.user as ReadUser);
        //     }
        // );

        const cacheSpyAllUsers = TestBed.inject(CacheService);
        (cacheSpyAllUsers as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ApiResponseData<UsersResponse> = MockUsers.mockUsers();
                return of(response.body.users as ReadUser[]);
            }
        );

        fixture = TestBed.createComponent(UserFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    xit('should create', () => {
        expect<any>(localStorage.getItem('session')).toBe(
            JSON.stringify(TestConfig.CurrentSession)
        );
        expect(component).toBeTruthy();
    });

    // todo: should edit the user profile, check the submission and the validation of the form
});
