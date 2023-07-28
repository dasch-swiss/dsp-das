import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    signal,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import {
    ComponentCommunicationEventService,
    EmitEvent,
    Events,
} from '../../services/component-communication-event.service';
import {
    AuthError,
    Session,
    SessionService,
} from '@dasch-swiss/vre/shared/app-session';
import { takeLast } from 'rxjs/operators';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
})
export class LoginFormComponent implements OnInit {
    /**
     * set whether or not you want icons to display in the input fields
     *
     * @param icons
     */
    @Input() icons?: boolean;

    /**
     * emits true when the login process was successful and false in case of error
     *
     * @param loginSuccess
     *
     */
    @Output() loginSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * emits true when the logout process was successful and false in case of error
     *
     * @param logoutSuccess
     *
     */
    @Output() logoutSuccess: EventEmitter<boolean> =
        new EventEmitter<boolean>();

    session = signal<Session | undefined>(undefined);

    // form
    form: UntypedFormGroup;

    // show progress indicator
    loading = false;

    // in case of an error
    isError: boolean;

    // specific error messages
    loginFailed = false;
    loginErrorServer = false;

    // labels for the login form
    // todo: should be handled by translation service (i18n)
    formLabel = {
        title: 'Login here',
        name: 'Username',
        pw: 'Password',
        submit: 'Login',
        retry: 'Retry',
        logout: 'LOGOUT',
        remember: 'Remember me',
        forgotPassword: 'Forgot password?',
        error: {
            failed: 'Password or username is wrong',
            server: 'An error has occurred when connecting to the server. Try again later or contact the DaSCH support.',
        },
    };

    // error definitions for the following form fields
    formErrors = {
        username: '',
        password: '',
    };

    // error messages for the form fields defined in formErrors
    validationMessages = {
        username: {
            required: 'user name is required.',
        },
        password: {
            required: 'password is required',
        },
    };

    constructor(
        private _componentCommsService: ComponentCommunicationEventService,
        private _fb: UntypedFormBuilder,
        private _sessionService: SessionService
    ) {}

    /**
     * The login form is currently only shown from the user-menu.component.ts.
     * The use case of showing the login form when the user is redirected
     * to /login?returnUrl=... was removed.
     */
    ngOnInit() {
        console.log('login form init');
        this.buildLoginForm();
    }

    buildLoginForm(): void {
        this.form = this._fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });
    }

    /**
     * login
     */
    login() {
        this.loading = true;
        this.isError = false;

        // grab values from form
        const identifier: string = this.form.get('username').value;
        const password: string = this.form.get('password').value;

        this._sessionService
            .login(identifier, password)
            .pipe(takeLast(1))
            .subscribe(
                (loginResult) => {
                    if (loginResult) {
                        this.loginSuccess.emit(true);

                        this._componentCommsService.emit(
                            new EmitEvent(Events.loginSuccess, true)
                        );
                        window.location.reload();
                    }
                    this.loading = false;
                },
                (error: AuthError) => {
                    this.loginSuccess.emit(false);

                    this._componentCommsService.emit(
                        new EmitEvent(Events.loginSuccess, false)
                    );

                    this.loading = false;
                    this.isError = true;

                    if (error.status === 401) {
                        this.loginFailed = true;
                    } else {
                        this.loginErrorServer = true;
                    }
                }
            );
    }

    logout() {
        // bring back the logout method and use it in the parent (somehow)
        this._sessionService.logout();
    }
}
