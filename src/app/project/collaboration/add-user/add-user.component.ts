import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
    ApiResponseData,
    ApiResponseError,
    KnoraApiConnection,
    MembersResponse,
    ProjectResponse,
    ReadProject,
    ReadUser,
    UserResponse,
    UsersResponse
} from '@dasch-swiss/dsp-js';
import { AutocompleteItem, DspApiConnectionToken, existingNamesValidator } from '@dasch-swiss/dsp-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-add-user',
    templateUrl: './add-user.component.html',
    styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

    /**
     * project name to get existing team members
     * or to know where to add selected user
     */
    @Input() projectCode: string;

    /**
     * event emitter, when the selected user will be added to the list
     */
    @Output() refreshParent: EventEmitter<any> = new EventEmitter<any>();

    /**
     * status for the progress indicator
     */
    loading = true;

    /**
     * form group
     */
    selectUserForm: FormGroup;

    /**
     * form errors
     */
    selectUserErrors = {
        'username': ''
    };

    /**
     * form error hints
     */
    validationMessages = {
        'username': {
            'existingName': 'This user is already a member of the project. You can\'t add him / her.'
        }
    };

    /**
     * list of all users
     */
    users: AutocompleteItem[] = [];

    /**
     * filter users while typing (autocomplete)
     */
    filteredUsers: Observable<AutocompleteItem[]>;

    /**
     * list of usernames to prevent duplicate entries
     */
    existingUsernames: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];
    /**
     * list of usernames of project members to prevent duplicate entries
     */
    existingUsernameInProject: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];

    /**
     * list of emails to prevent duplicate entries
     */
    existingEmails: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];

    /**
     * list of emails of project members to prevent duplicate entries
     */
    existingEmailInProject: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];


    /**
     * selected user object
     */
    selectedUser: ReadUser;

    /**
     * member status of selected user
     */
    isAlreadyMember = false;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _dialog: MatDialog,
        private _errorHandler: ErrorHandlerService,
        private _formBuilder: FormBuilder
    ) { }

    ngOnInit() {

        // build the form
        this.buildForm();
    }

    buildForm(): void {

        // clean autocomplete list
        this.users = [];

        // set the cache
        this._cache.get('allUsers', this._dspApiConnection.admin.usersEndpoint.getUsers());

        // get all users; response from cache
        this._cache.get('allUsers', this._dspApiConnection.admin.usersEndpoint.getUsers()).subscribe(
            (response: ApiResponseData<UsersResponse>) => {

                // if a user is already member of the team, mark it in the list
                const members: string[] = [];

                // get all members of this project; response from cache
                this._cache.get('members_of_' + this.projectCode, this._dspApiConnection.admin.projectsEndpoint.getProjectMembersByShortcode(this.projectCode)).subscribe(
                    (res: ApiResponseData<MembersResponse>) => {
                        for (const m of res.body.members) {
                            members.push(m.id);

                            // if the user is already member of the project
                            // add the email to the list of existing
                            this.existingEmailInProject.push(
                                new RegExp('(?:^|W)' + m.email.toLowerCase() + '(?:$|W)')
                            );
                            // add username to the list of existing
                            this.existingUsernameInProject.push(
                                new RegExp('(?:^|W)' + m.username.toLowerCase() + '(?:$|W)')
                            );
                        }

                        let i = 0;
                        for (const u of response.body.users) {

                            // if the user is already member of the project
                            // add the email to the list of existing
                            this.existingEmails.push(
                                new RegExp('(?:^|W)' + u.email.toLowerCase() + '(?:$|W)')
                            );
                            // add username to the list of existing
                            this.existingUsernames.push(
                                new RegExp('(?:^|W)' + u.username.toLowerCase() + '(?:$|W)')
                            );

                            let existsInProject = '';

                            if (members && members.indexOf(u.id) > -1) {
                                existsInProject = '* ';
                            }

                            this.users[i] = {
                                iri: u.id,
                                name: u.username,
                                label: existsInProject + u.username + ' | ' + u.email + ' | ' + u.givenName + ' ' + u.familyName
                            };
                            i++;
                        }

                        this.users.sort(function (u1: AutocompleteItem, u2: AutocompleteItem) {
                            if (u1.label < u2.label) {
                                return -1;
                            } else if (u1.label > u2.label) {
                                return 1;
                            } else {
                                return 0;
                            }
                        });
                    },
                    (error: ApiResponseError) => {
                        this._errorHandler.showMessage(error);
                    }
                );

                this.loading = false;

            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );

        this.selectUserForm = this._formBuilder.group({
            'username': new FormControl({
                value: '', disabled: false
            }, [
                existingNamesValidator(this.existingUsernames),
                existingNamesValidator(this.existingUsernameInProject),
                existingNamesValidator(this.existingEmails),
                existingNamesValidator(this.existingEmailInProject)
            ])
        });

        this.filteredUsers = this.selectUserForm.controls['username'].valueChanges
            .pipe(
                startWith(''),
                map(user => user.length >= 2 ? this.filter(this.users, user) : [])
            );

        this.selectUserForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged(); // (re)set validation messages now

    }


    /**
     * filter a list while typing in auto complete input field
     * @param list List of options
     * @param name Value to filter by
     * @returns Filtered list of options
     */
    filter(list: AutocompleteItem[], name: string) {
        return list.filter(user =>
            user.label.toLowerCase().includes(name.toLowerCase())
        );
    }


    /**
     * set the error messages on value changed
     *
     * @param (data)
     */
    onValueChanged(data?: any) {

        if (!this.selectUserForm) {
            return;
        }

        // reset selected user
        this.selectedUser = undefined;

        // check if the form is valid
        Object.keys(this.selectUserErrors).map(field => {

            this.selectUserErrors[field] = '';
            const control = this.selectUserForm.get(field);
            if (control.value.length >= 2) {
                if (control && control.dirty && !control.valid) {
                    const messages = this.validationMessages[field];
                    Object.keys(control.errors).map(key => {
                        this.selectUserErrors[field] += messages[key] + ' ';
                    });
                }
            }

        });
    }

    /**
     * add user to the project
     *
     * @param val The value can be e-mail address or username
     */
    addUser(val: string) {

        // --> TODO add getUserByEmail
        // you can type username or email. We have to check, what we have now
        this._dspApiConnection.admin.usersEndpoint.getUserByUsername(val).subscribe(
            (response: ApiResponseData<UserResponse>) => {
                // case b) result if the user exists
                this.selectedUser = response.body.user;

                // the following request should never start
                this.isAlreadyMember = (!!response.body.user.projects.find(p => p.shortcode === this.projectCode));

                if (!this.isAlreadyMember) {

                    this.loading = true;

                    // get project iri by projectCode
                    this._cache.get(this.projectCode).subscribe(
                        (p: ReadProject) => {
                            // add user to project
                            this._dspApiConnection.admin.usersEndpoint.addUserToProjectMembership(this.selectedUser.id, p.id).subscribe(
                                (userAdded: ApiResponseData<UserResponse>) => {

                                    // successful post
                                    // reload the component
                                    this.buildForm();
                                    this.refreshParent.emit();

                                    // update own user profile, if the added user is the same as the logged-in user
                                    // get logged-in user name
                                    // const session: Session = JSON.parse(localStorage.getItem('session'));
                                    // if (add.username === session.user.name) {
                                    this._cache.del(userAdded.body.user.username);
                                    this._cache.get(userAdded.body.user.username, this._dspApiConnection.admin.usersEndpoint.getUserByUsername(userAdded.body.user.username));
                                    // }
                                    this.loading = false;

                                },
                                (error: ApiResponseError) => {
                                    this._errorHandler.showMessage(error);
                                }
                            );
                        },
                        (error: ApiResponseError) => {
                            this._errorHandler.showMessage(error);
                        }
                    );
                }

            },
            (error: ApiResponseError) => {
                if (error.status === 404) {
                    // case c) user doesn't exist
                    // create new user user-profile
                    this.selectedUser = new ReadUser();

                    this.selectedUser.email = val;

                } else {
                    // api error
                    this._errorHandler.showMessage(error);
                }

            }
        );
    }

    openDialog(mode: string): void {
        const dialogConfig: MatDialogConfig = {
            width: '560px',
            maxHeight: '80vh',
            position: {
                top: '112px'
            },
            data: { project: this.projectCode, name: this.selectUserForm.controls['username'].value, mode: mode }
        };

        const dialogRef = this._dialog.open(DialogComponent, dialogConfig);

        dialogRef.afterClosed().subscribe(response => {
            // update the view
            this.refreshParent.emit();
        });
    }

    resetInput(ev: Event) {
        ev.preventDefault();
        this.selectUserForm.controls['username'].reset('');
    }

}
