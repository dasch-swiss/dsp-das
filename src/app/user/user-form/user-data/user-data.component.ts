import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceError, User, UsersService, Utils } from '@knora/core';
import { CacheService } from '../../../main/cache/cache.service';

@Component({
    selector: 'app-user-data',
    templateUrl: './user-data.component.html',
    styleUrls: ['./user-data.component.scss']
})
export class UserDataComponent implements OnInit, OnChanges {

    /**
     * user iri in the case of edit
     */
    @Input() userName?: string;

    /**
     * user user-profile in case of edit?
     */
    @Input() user?: User;

    /**
     * Is the form a standalone or embedded in a step by step form wizard?
     *
     * @type {boolean}
     */
    @Input() standalone = true;

    /**
     *
     * @type {EventEmitter<User>}
     */
    @Output() userData = new EventEmitter<User>();

    // form group for the form controller
    userDataForm: FormGroup;

    // error checking on the following fields
    formErrors = {
        'givenName': '',
        'familyName': '',
        //        'email': '',
        'password': ''
    };

    // ...and the error hints
    validationMessages = {
        'givenName': {
            'required': 'First name is required.'
        },
        'familyName': {
            'required': 'Last name is required.'
        },
        /*
        'email': {
            'required': 'Email address is required.',
            'pattern': 'This doesn\'t appear to be a valid email address.',
            'existingName': 'This email address exists already.'
        },
        */
        'password': {
            'required': 'A password is required.',
            'minlength': 'Use at least 8 characters.',
            'pattern': 'The password should have at least one uppercase letter and one number.',
        }
    };

    // password visibility
    showPassword = false;

    // in case of an API error
    errorMessage: any;

    // in case of success:
    success = false;
    successMessage: any = {
        status: 200,
        statusText: 'You have successfully updated the user user-profile.'
    };

    // show the content after every service has loaded and the data is ready
    loading = true;


    languagesList: any[] = [
        {
            id: 'en',
            name: 'english'
        },
        {
            id: 'de',
            name: 'deutsch'
        },
        {
            id: 'fr',
            name: 'français'
        },
        {
            id: 'it',
            name: 'italiano'
        }
    ];

    constructor(private _route: ActivatedRoute,
                private _cache: CacheService,
                private _users: UsersService,
                private _formBuilder: FormBuilder) {

        const routeParams = this._route.parent.snapshot.params;
        this.userName = decodeURIComponent(routeParams.name);
    }

    ngOnInit() {

        this.loading = true;

        if (!this.user && this.userName) {

            this._cache.get(this.userName, this._users.getUser(this.userName)).subscribe(
                (response: any) => {
                    this.user = response;
                    this.buildForm(this.user);
                    this.loading = false;
                },
                (error: any) => {
                    console.error(error);
                }
            );

        } else {

            this.buildForm(this.user);

            this.loading = false;
        }

    }

    ngOnChanges() {
        if (this.user) {
            this.buildForm(this.user);
        }
    }


    /**
     *
     * @param {User} user
     */
    buildForm(user: User): void {

        // if user is defined, we're in the edit mode
        // otherwise "create new user" mode is active
        const edit: boolean = (!!user.id);

        this.userDataForm = this._formBuilder.group({
            'givenName': new FormControl({
                value: user.givenName, disabled: false
            }, [
                Validators.required
            ]),
            'familyName': new FormControl({
                value: user.familyName, disabled: false
            }, [
                Validators.required
            ]),
            'email': new FormControl({
                value: user.email, disabled: true
            }),
            'password': new FormControl({
                value: user.password, disabled: (edit)
            }, [
                Validators.required,
                Validators.minLength(8),
                Validators.pattern(Utils.RegexPassword)
            ]),
            'lang': new FormControl({
                value: (user.lang ? user.lang : 'en'), disabled: false
            })
            //            'status': user.userData.status,
            //            'systemAdmin': this.sysAdminPermission,
            //            'group': null
        });

        //        this.loading = false;


        this.userDataForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        //        this.onValueChanged(); // (re)set validation messages now

    }

    /**
     *
     * @param data
     */
    onValueChanged(data?: any) {

        if (!this.userDataForm) {
            return;
        }

        const form = this.userDataForm;

        Object.keys(this.formErrors).map(field => {
            this.formErrors[field] = '';
            const control = form.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.formErrors[field] += messages[key] + ' ';
                });

            }
        });
    }

    /**
     * toggle the visibility of the password
     */
    toggleVisibility() {
        this.showPassword = (!this.showPassword);
    }

    /**
     *
     */
    submitData(): void {

        if (this.standalone) {
            this.loading = true;
            // this method is only used in standalone user data form
            // to edit user user-profile
            this._users.updateUser(this.user.id, this.userDataForm.value).subscribe(
                (result: User) => {
                    this.user = result;
                    this.buildForm(this.user);
                    this.loading = false;
                    this.success = true;
                },
                (error: ApiServiceError) => {
                    this.errorMessage = error;
                    this.loading = false;
                    this.success = false;
                }
            );
        } else {
            this.userData.emit(this.userDataForm.value);
        }
    }

}
