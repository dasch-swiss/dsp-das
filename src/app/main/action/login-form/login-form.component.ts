import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, LoginResponse, LogoutResponse } from '@dasch-swiss/dsp-js';
import { CacheService } from '../../cache/cache.service';
import { DspApiConnectionToken } from '../../declarations/dsp-api-tokens';
import { ErrorHandlerService } from '../../error/error-handler.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ComponentCommunicationEventService, EmitEvent, Events } from '../../services/component-communication-event.service';
import { DatadogRumService } from '../../services/datadog-rum.service';
import { Session, SessionService } from '../../services/session.service';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit, AfterViewInit {

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
    @Output() logoutSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();

    // @ViewChild('username') usernameInput: ElementRef;

    // is there already a valid session?
    session: Session;

    // form
    form: FormGroup;

    // show progress indicator
    loading = false;

    // url history
    returnUrl: string;

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
            server: 'An error has occurred when connecting to the server. Try again later or contact the DaSCH support.'
        }
    };

    // error definitions for the following form fields
    formErrors = {
        username: '',
        password: ''
    };

    // error messages for the form fields defined in formErrors
    validationMessages = {
        username: {
            required: 'user name is required.'
        },
        password: {
            required: 'password is required'
        }
    };

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _auth: AuthenticationService,
        private _componentCommsService: ComponentCommunicationEventService,
        private _datadogRumService: DatadogRumService,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder,
        private _session: SessionService,
        private _route: ActivatedRoute,
        private _router: Router,
    ) {
        this.returnUrl = this._route.snapshot.queryParams['returnUrl'];
    }

    ngOnInit() {
        // if session is valid (a user is logged-in) show a message, otherwise build the form
        this._session.isSessionValid().subscribe(
            result => {
                // returns a result if session is still valid
                if (result) {
                    this.session = JSON.parse(localStorage.getItem('session'));
                } else {
                    // session is invalid, build the login form
                    this.buildLoginForm();
                }
            }
        );
    }

    ngAfterViewInit() {
        if (this.session) {
            // this.usernameInput.nativeElement.focus();
        }
    }

    buildLoginForm(): void {
        this.form = this._fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    /**
     *
     * login and set session
     */
    login() {

        this.loading = true;
        this.isError = false;

        // grab values from form
        const identifier = this.form.get('username').value;
        const password = this.form.get('password').value;

        const identifierType: 'iri' | 'email' | 'username' = (identifier.indexOf('@') > -1 ? 'email' : 'username');

        this._dspApiConnection.v2.auth.login(identifierType, identifier, password).subscribe(
            (response: ApiResponseData<LoginResponse>) => {
                this._session.setSession(response.body.token, identifier, identifierType).subscribe(
                    () => {
                        this.loginSuccess.emit(true);
                        this.session = this._session.getSession();

                        this._componentCommsService.emit(new EmitEvent(Events.loginSuccess, true));
                        this.returnUrl = this._route.snapshot.queryParams['returnUrl'];
                        if (this.returnUrl) {
                            this._router.navigate([this.returnUrl]);
                        } else {
                            window.location.reload();
                        }
                        this._datadogRumService.setActiveUser(identifier, identifierType);
                        this.loading = false;

                    }
                );
            },
            (error: ApiResponseError) => {
                // error handling
                this.loginFailed = (error.status === 401 || error.status === 404);
                this.loginErrorServer = (error.status === 0 || error.status >= 500 && error.status < 600);

                if (this.loginErrorServer) {
                    this._errorHandler.showMessage(error);
                }

                this.isError = true;

                this.loading = false;

                // log error to Rollbar (done automatically by simply throwing a new Error)
                throw new Error('login failed');
            }
        );
    }

    logout() {
        // bring back the logout method and use it in the parent (somehow)
        this._auth.logout();
    }


}
