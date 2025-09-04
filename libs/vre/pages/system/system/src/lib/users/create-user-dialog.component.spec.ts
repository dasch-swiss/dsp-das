import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/3rd-party-services/api';
import {
  PasswordConfirmFormComponent,
  PasswordFormFieldComponent,
  UserForm,
  UserFormComponent,
} from '@dasch-swiss/vre/pages/user-settings/user';

import { DialogHeaderComponent } from '@dasch-swiss/vre/shared/app-common-to-move';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/string-literal';
import { CommonInputComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CreateUserDialogComponent } from './create-user-dialog.component';

describe('CreateUserDialogComponent', () => {
  let component: CreateUserDialogComponent;
  let fixture: ComponentFixture<CreateUserDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CreateUserDialogComponent>>;
  let mockUserApiService: jasmine.SpyObj<UserApiService>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const userApiServiceSpy = jasmine.createSpyObj('UserApiService', ['create']);

    await TestBed.configureTestingModule({
      declarations: [
        CreateUserDialogComponent,
        DialogHeaderComponent,
        UserFormComponent,
        PasswordConfirmFormComponent,
        PasswordFormFieldComponent,
        CommonInputComponent,
        HumanReadableErrorPipe,
        LoadingButtonDirective,
      ],
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: UserApiService, useValue: userApiServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateUserDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreateUserDialogComponent>>;
    mockUserApiService = TestBed.inject(UserApiService) as jasmine.SpyObj<UserApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default data', () => {
    expect(component.data).toEqual({
      givenName: '',
      familyName: '',
      email: '',
      username: '',
      lang: 'en',
      isSystemAdmin: false,
    });
    expect(component.isLoading).toBeFalse();
  });

  it('should add controls to form when child components initialize', () => {
    const mockUserForm = new FormBuilder().group({
      givenName: [''],
      familyName: [''],
      email: [''],
      username: [''],
      lang: ['en'],
    }) as UserForm;

    const mockPasswordControl = new FormControl('');

    component.afterUserFormInit(mockUserForm);
    component.afterPasswordFormInit(mockPasswordControl);

    expect(component.form.controls.user).toBe(mockUserForm);
    expect(component.form.controls.password).toBe(mockPasswordControl);
  });

  it('should not create user when form is invalid', () => {
    component.createUser();

    expect(mockUserApiService.create).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  });

  it('should create user successfully when form is valid', () => {
    const mockUserForm = new FormBuilder().group({
      givenName: ['John'],
      familyName: ['Doe'],
      email: ['john.doe@example.com'],
      username: ['johndoe'],
      lang: ['en'],
    }) as UserForm;

    const mockPasswordControl = new FormControl('validPassword123');
    const mockResponse = { user: { id: 'user123' } };

    component.afterUserFormInit(mockUserForm);
    component.afterPasswordFormInit(mockPasswordControl);
    mockUserApiService.create.and.returnValue(of(mockResponse));

    component.createUser();

    expect(mockUserApiService.create).toHaveBeenCalledWith(jasmine.any(User));
    expect(mockDialogRef.close).toHaveBeenCalledWith('user123');
  });
});
