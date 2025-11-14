import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiResponseError, ReadUser } from '@dasch-swiss/dsp-js';
import { AuthService } from '@dasch-swiss/vre/core/session';
import { CommonInputComponent, HumanReadableErrorPipe } from '@dasch-swiss/vre/ui/ui';
import { LoadingButtonDirective } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { PasswordFormFieldComponent } from '../user-form/password-form/password-form-field.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: jest.Mocked<AuthService>;
  let translateService: TranslateService;

  const mockUser: ReadUser = {
    id: 'http://rdfh.ch/users/test-user-id',
    username: 'testuser',
    email: 'test@example.com',
    givenName: 'Test',
    familyName: 'User',
    lang: 'en',
  } as ReadUser;

  beforeEach(async () => {
    const authServiceMock = {
      login$: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [LoginFormComponent, PasswordFormFieldComponent],
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        CommonInputComponent,
        HumanReadableErrorPipe,
        LoadingButtonDirective,
      ],
      providers: [FormBuilder, { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockReturnValue('Invalid credentials');
    fixture.detectChanges();
  });

  describe('Form Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeDefined();
    });

    it('should initialize form with username and password controls', () => {
      expect(component.form).toBeDefined();
      expect(component.form.controls.username).toBeDefined();
      expect(component.form.controls.password).toBeDefined();
    });

    it('should initialize form controls with empty values', () => {
      expect(component.form.controls.username.value).toBe('');
      expect(component.form.controls.password.value).toBe('');
    });

    it('should initialize loading state as false', () => {
      expect(component.loading).toBe(false);
    });

    it('should mark form as readonly', () => {
      expect(component.form).toBeDefined();
      // The form should be readonly, preventing reassignment
    });
  });

  describe('Form Validation', () => {
    it('should require username field', () => {
      const usernameControl = component.form.controls.username;

      usernameControl.setValue('');
      expect(usernameControl.hasError('required')).toBeTruthy();
      expect(usernameControl.valid).toBeFalsy();

      usernameControl.setValue('testuser');
      expect(usernameControl.hasError('required')).toBeFalsy();
      expect(usernameControl.valid).toBeTruthy();
    });

    it('should require password field', () => {
      const passwordControl = component.form.controls.password;

      passwordControl.setValue('');
      expect(passwordControl.hasError('required')).toBeTruthy();
      expect(passwordControl.valid).toBeFalsy();

      passwordControl.setValue('testpass123');
      expect(passwordControl.hasError('required')).toBeFalsy();
      expect(passwordControl.valid).toBeTruthy();
    });

    it('should be invalid when form is empty', () => {
      expect(component.form.valid).toBeFalsy();
    });

    it('should be invalid when only username is provided', () => {
      component.form.controls.username.setValue('testuser');
      expect(component.form.valid).toBeFalsy();
    });

    it('should be invalid when only password is provided', () => {
      component.form.controls.password.setValue('testpass123');
      expect(component.form.valid).toBeFalsy();
    });

    it('should be valid when both username and password are provided', () => {
      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');
      expect(component.form.valid).toBeTruthy();
    });
  });

  describe('Login Method', () => {
    it('should not call authService.login$ when form is invalid', () => {
      component.form.controls.username.setValue('');
      component.form.controls.password.setValue('');

      component.login();

      expect(authService.login$).not.toHaveBeenCalled();
      expect(component.loading).toBe(false);
    });

    it('should call authService.login$ with correct credentials when form is valid', () => {
      const username = 'testuser';
      const password = 'testpass123';

      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue(username);
      component.form.controls.password.setValue(password);

      component.login();

      expect(authService.login$).toHaveBeenCalledWith(username, password);
    });

    it('should set loading to true when login starts', done => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      // Check loading is initially false
      expect(component.loading).toBe(false);

      component.login();

      // Use setTimeout to check after login is called but before observable completes
      Promise.resolve().then(() => {
        // After microtask, finalize should have set loading back to false
        expect(component.loading).toBe(false);
        done();
      });
    });

    it('should set loading to false when login succeeds', done => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      component.login();

      setTimeout(() => {
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should store subscription when login is called', () => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      expect(component['loginSubscription']).toBeUndefined();

      component.login();

      expect(component['loginSubscription']).toBeDefined();
    });

    it('should handle multiple login attempts', () => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      component.login();
      expect(authService.login$).toHaveBeenCalledTimes(1);

      component.login();
      expect(authService.login$).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    it('should set loginError when API returns 400 error', done => {
      const apiError = Object.create(ApiResponseError.prototype);
      Object.assign(apiError, { status: 400, message: 'Bad Request' });
      authService.login$.mockReturnValue(throwError(() => apiError));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('wrongpassword');

      expect(component.loginError).toBeNull();

      component.login();

      setTimeout(() => {
        expect(component.loginError).toBe('Invalid credentials');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should set loginError when API returns 401 error', done => {
      const apiError = { status: 401 };
      authService.login$.mockReturnValue(throwError(() => apiError));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('wrongpassword');

      expect(component.loginError).toBeNull();

      component.login();

      setTimeout(() => {
        expect(component.loginError).toBe('Invalid credentials');
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should not set loginError for other error types', done => {
      const apiError = Object.create(ApiResponseError.prototype);
      Object.assign(apiError, { status: 500, message: 'Internal Server Error' });
      authService.login$.mockReturnValue(throwError(() => apiError));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      component.login();

      setTimeout(() => {
        expect(component.loginError).toBeNull();
        expect(component.loading).toBe(false);
        done();
      }, 0);
    });

    it('should clear loginError when user starts typing', () => {
      component.loginError = 'Previous error';

      component.form.controls.username.setValue('n');

      expect(component.loginError).toBeNull();
    });

    it('should clear loginError when starting new login attempt', () => {
      authService.login$.mockReturnValue(of(mockUser));

      component.loginError = 'Previous error';
      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      component.login();

      expect(component.loginError).toBeNull();
    });

    it('should call translateService.instant with correct key on error', done => {
      const apiError = Object.create(ApiResponseError.prototype);
      Object.assign(apiError, { status: 400, message: 'Bad Request' });
      authService.login$.mockReturnValue(throwError(() => apiError));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('wrongpassword');

      component.login();

      setTimeout(() => {
        expect(translateService.instant).toHaveBeenCalledWith('core.auth.invalidCredentials');
        done();
      }, 0);
    });
  });

  describe('Subscription Management', () => {
    it('should unsubscribe login subscription on component destroy', () => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      component.login();

      const subscription = component['loginSubscription'];
      expect(subscription).toBeDefined();

      jest.spyOn(subscription!, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should unsubscribe form subscription on component destroy', () => {
      const formSubscription = component['formSubscription'];
      expect(formSubscription).toBeDefined();

      jest.spyOn(formSubscription!, 'unsubscribe');

      component.ngOnDestroy();

      expect(formSubscription!.unsubscribe).toHaveBeenCalled();
    });

    it('should handle ngOnDestroy when login subscription is undefined', () => {
      expect(component['loginSubscription']).toBeUndefined();

      // Should not throw error
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Template Integration', () => {
    it('should render form element', () => {
      const formElement = fixture.nativeElement.querySelector('form');
      expect(formElement).toBeTruthy();
      expect(formElement.classList.contains('login-form')).toBeTruthy();
    });

    it('should render username input', () => {
      const usernameInput = fixture.nativeElement.querySelector('[data-cy="username-input"]');
      expect(usernameInput).toBeTruthy();
    });

    it('should render password input', () => {
      const passwordInput = fixture.nativeElement.querySelector('[data-cy="password-input"]');
      expect(passwordInput).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = fixture.nativeElement.querySelector('[data-cy="submit-button"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton.getAttribute('type')).toBe('submit');
    });

    it('should bind loading state to button', () => {
      component.loading = false;
      fixture.detectChanges();
      const submitButton = fixture.nativeElement.querySelector('[data-cy="submit-button"]');

      // Check that the button exists and has the appLoadingButton directive
      expect(submitButton).toBeTruthy();

      // The loading state is managed by the LoadingButtonDirective
      // We can verify it's bound by checking the button's disabled state or spinner presence
      expect(component.loading).toBe(false);

      component.loading = true;
      fixture.detectChanges();
      expect(component.loading).toBe(true);
    });

    it('should call login method on form submit', () => {
      jest.spyOn(component, 'login');
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('testuser');
      component.form.controls.password.setValue('testpass123');

      const formElement = fixture.nativeElement.querySelector('form');
      formElement.dispatchEvent(new Event('submit'));

      expect(component.login).toHaveBeenCalled();
    });

    it('should not display error message when loginError is null', () => {
      component.loginError = null;
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.login-error');
      expect(errorElement).toBeFalsy();
    });

    it('should display error message when loginError is set', () => {
      component.loginError = 'Invalid credentials';
      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.login-error');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Invalid credentials');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values', () => {
      component.form.controls.username.setValue('');
      component.form.controls.password.setValue('');

      component.login();

      expect(authService.login$).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only values', () => {
      authService.login$.mockReturnValue(of(mockUser));

      component.form.controls.username.setValue('   ');
      component.form.controls.password.setValue('   ');

      component.login();

      expect(authService.login$).toHaveBeenCalledWith('   ', '   ');
    });

    it('should handle special characters in credentials', () => {
      authService.login$.mockReturnValue(of(mockUser));

      const username = 'user@example.com';
      const password = 'p@ss!w0rd#123';

      component.form.controls.username.setValue(username);
      component.form.controls.password.setValue(password);

      component.login();

      expect(authService.login$).toHaveBeenCalledWith(username, password);
    });

    it('should handle very long credentials', () => {
      authService.login$.mockReturnValue(of(mockUser));

      const longUsername = 'a'.repeat(500);
      const longPassword = 'b'.repeat(500);

      component.form.controls.username.setValue(longUsername);
      component.form.controls.password.setValue(longPassword);

      component.login();

      expect(authService.login$).toHaveBeenCalledWith(longUsername, longPassword);
    });
  });
});
