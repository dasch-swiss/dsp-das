import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { existingNamesValidator } from '@knora/action';
import { ApiServiceError, AutocompleteItem, KnoraConstants, User, UsersService, Utils } from '@knora/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CacheService } from '../../main/cache/cache.service';

@Component({
    selector: 'app-user-form',
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {


    // general stuff
    isLoading = true;

    isLinear = true;

    // ------------------------------------------------------------------------
    // first step:
    //  - select user or set new user by entering an email address (in system and project view)
    //
    userFormGroup: FormGroup;

    // form errors of first form group
    userFormErrors = {
        'username': ''
    };

    // ...and the error hints
    firstValidationMessages = {
        'username': {
            'required': 'Email address is required.',
            'pattern': 'This doesn\'t appear to be a valid email address.',
            'existingName': 'This user exists already. If you want to edit it, ask a system administrator.',
            'member': 'This user is already a member of the project.'
        }
    };

    // list of all users
    users: AutocompleteItem[] = [];

    // filter users while typing (autocomplete)
    filteredUsers: Observable<any>;

    // user data of selected user
    selectedUser: User;

    existingUserNames: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];
//    usernameRegex = /^[a-zA-Z]+\S*$/;


    //
    // ------------------------------------------------------------------------


    // ------------------------------------------------------------------------
    // second step:
    //  - create new user (in system and project view)
    //  - edit user, if userIri is defined

    @Input() userIri?: string;
    isAlreadyMember = false;
    email: string;

    //
    // ------------------------------------------------------------------------


    // ------------------------------------------------------------------------
    // third step:
    //  - select project (in system view) / project name (in project view)
    //  - depending on the select project: select permission groups
    //

    @Input() projectIri?: string = undefined;

    // selected groups
    selectedGroups: AutocompleteItem[];

    // project data of selected project
    selectedProject: AutocompleteItem;

    //
    // ------------------------------------------------------------------------


    // ------------------------------------------------------------------------
    // fourth step:
    //  - send all the data to the api server
    //

    // from step 2: submit user data; activate the progress loader
    submitUserStatus = -1;
    // on error with user data
    userErrorMessage: ApiServiceError = undefined;

    // from step 3: submit project membership; activate the progress loader
    submitMembershipStatus = -1;
    membershipErrorMessage: ApiServiceError = undefined;

    // from step 3: submit group permissions; activate the progress loader
    submitPermissionsStatus = -1;
    // on error with permissions data
    permissionsErrorMessage: ApiServiceError = undefined;

    //
    // ------------------------------------------------------------------------


    // ------------------------------------------------------------------------
    // error handling
    //
    // general api error message
    errorMessage: any = undefined;

    //
    // ------------------------------------------------------------------------


    constructor(private _cache: CacheService,
                public _usersService: UsersService,
                private _formBuilder: FormBuilder) {

    }

    ngOnInit() {

        const cache: any = this._cache.get('allUsers', this._usersService.getAllUsers());

        this.buildFirstForm();

    }

    /**
     * First form is an input field with an auto complete method to get an existing user
     *
     */
    buildFirstForm(): void {

        this._usersService.getAllUsers()
            .subscribe(
                (result: User[]) => {

                    // list of users to prevent duplicate entries
                    // TODO: it's never used in this component. What should we do?
                    const existingUserNames: [RegExp] = [
                        new RegExp('anEmptyRegularExpressionWasntPossible')
                    ];

                    // The email address of the user should be unique.
                    // Therefore we create a list of existingUserNames to avoid multiple use of user names
                    for (const user of result) {
                        existingUserNames.push(
                            new RegExp('(?:^|\W)' + user.email.toLowerCase() + '(?:$|\W)')
                        );
                    }

                    let members: string[];
                    if (this.projectIri) {
                        // get the members of the project
                        members = JSON.parse(sessionStorage.getItem('currentMembers'));
                    }

                    let i: number = 1;
                    for (const u of result) {

                        let exists: string = '';

                        if (members && members.indexOf(u.id) > -1) {
                            exists = '* ';
                        }

                        this.users[i] = {
                            iri: u.id,
                            name: u.email,
                            label: exists + u.givenName + ' ' + u.familyName + ' (' + u.email + ')'
                        };
                        i++;
                    }

                    this.users.sort(function (u1, u2) {
                        if (u1.label < u2.label) {
                            return -1;
                        } else if (u1.label > u2.label) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    this.filteredUsers = this.userFormGroup.controls['username'].valueChanges
                        .pipe(
                            startWith(this.userFormGroup.controls['username'].value),
                            map(user => user ? this.filter(this.users, user) : this.users.slice())
                        );

                    /*
                                        this.filteredUsers = this.form.controls['username'].valueChanges
                                            .pipe(
                                                startWith(this.form.controls['username'].value),
                                                map(user => user ? this.filter(this.users, user) : this.users.slice())
                                            );
                    */
                    this.isLoading = false;

                },
                (error: ApiServiceError) => {
                    this.isLoading = false;
                    this.errorMessage = error;
                }
            );

        this.userFormGroup = this._formBuilder.group({
            'username': new FormControl({
                value: '', disabled: false
            }, [
                Validators.required,
                Validators.pattern(Utils.RegexEmail),
                existingNamesValidator(this.existingUserNames)
            ])
        });

        this.userFormGroup.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged(); // (re)set validation messages now

    }

    /**
     * filter a list while typing in auto complete input field
     * @param {AutocompleteItem[]} list
     * @param {string} name
     * @returns {AutocompleteItem[]}
     */
    filter(list: AutocompleteItem[], name: string) {
        return list.filter(user =>
            user.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    /**
     * set the error messages on value changed
     *
     * @param data
     */
    onValueChanged(data?: any) {

        if (!this.userFormGroup) {
            return;
        }

        // reset selected user
        this.selectedUser = undefined;

        // check if the form is valid
        Object.keys(this.userFormErrors).map(field => {
            this.userFormErrors[field] = '';
            const control = this.userFormGroup.get(field);
            if (control && control.dirty && !control.valid) {
                const messages = this.firstValidationMessages[field];
                Object.keys(control.errors).map(key => {
                    this.userFormErrors[field] += messages[key] + ' ';
                });
            }
        });
    }

    /**
     * set selected user from auto complete
     *
     * @param {string} username
     */
    setSelected(username?: string) {
        // set selected has four possible scenarios
        // a) the user selected one user from the auto-complete list, which gives us the user's IRI
        // b) the user typed in an eMail address of a new user. It means the user doesn't exist yet
        // c) the user typed in an eMail address of an existing user, but has not selected from the auto-complete list
        // d) the user typed in something else, which is not a valid eMail address,
        //    so the form isn't valid; the method for this case will never start

        if (this.selectedUser !== undefined) {
            return;
        }

        // which case do we have? option a - d?
        this.email = (username ? username : this.userFormGroup.controls['username'].value);

        // get user by username (email)
        this._usersService.getUser(this.email)
            .subscribe(
                (result: User) => {
                    // case b) result in case the user exists
                    this.selectedUser = result;

                    this.isAlreadyMember = (!!result.projects.find(p => p.id === this.projectIri));
                },
                (error: ApiServiceError) => {
                    if (error.status === 404) {
                        // case c) user doesn't exist
                        // create new user user-profile
                        this.selectedUser = new User();

                        this.selectedUser.email = this.email;

                    } else {
                        // api error
                        this.errorMessage = error;
                    }

                }
            );

    }

    resetSelected() {
        this.selectedUser = undefined;
    }

    getUserData(user: User) {
        // update the selectedUser data from UserDataComponent (child)
        if (this.selectedUser.id) {
            const id = this.selectedUser.id;
            // in case of update user user-profile:
            // change the selectedUser data
            this.selectedUser = user;
            this.selectedUser.email = this.email;
            this.selectedUser.id = id;
        } else {
            this.selectedUser = user;
            this.selectedUser.email = this.email;
        }
    }

    getUserRole(data: any) {

        // get an object with project information
        // and with selected groups information

        this.selectedProject = data.project;
        this.selectedGroups = data.groups;
    }

    submitData() {

        const userIri: string = this.selectedUser.id;

        // create or update the selected user
        this.submitUserStatus = 0;
        if (userIri) {
            // update user
            this._usersService.updateUser(userIri, this.selectedUser).subscribe(
                (result: User) => {

                    this.submitUserStatus = 1;

                    // next step: add user (by iri) to the project (if any is selected)
                    if (this.selectedProject) {
                        //                        console.log(this.isAlreadyMember);
                        if (!this.isAlreadyMember) {
                            this.addUserToProject(result.id);
                        } else {
                            // the user is already a member of the group;
                            // update the groups permissions only
                            this.setGroupsPermissions(result.id);
                        }
                    }

                },
                (error: ApiServiceError) => {
                    console.log(error);
                    this.submitUserStatus = 400;
                    this.userErrorMessage = error;
                }
            );
        } else {
            // create user
            this.selectedUser.status = true;
            this.selectedUser.systemAdmin = false;
            this._usersService.createUser(this.selectedUser).subscribe(
                (result: User) => {

                    this.submitUserStatus = 1;

                    // next step: add user (by iri) to the project (if any is selected)
                    if (this.selectedProject) {
                        this.addUserToProject(result.id);
                    }

                },
                (error: ApiServiceError) => {
                    console.log(error);
                    this.submitUserStatus = 400;
                    this.userErrorMessage = error;
                }
            );

        }

    }

    addUserToProject(userIri: string) {
        // next step: add user (by iri) to the selected project
        // if he's not yet a member

        this.submitMembershipStatus = 0;
        this._usersService.addUserToProject(userIri, this.selectedProject.iri).subscribe(
            (result: User) => {
                this.submitMembershipStatus = 1;

                // and set the permissions in a second step
                this.submitPermissionsStatus = 0;

                this.setGroupsPermissions(userIri);


                /*
                if (this.sysAdminPermission) {
                    this.submitPermissionsStatus = 0;
                    const data: any = {
                        systemAdmin: true
                    };
                    this._userService.addUserToSystemAdmin(uIri, data).subscribe(
                        (res: User) => {
                            this.submitPermissionsStatus = 1;
                        },
                        (error: ApiServiceError) => {
                            console.log(error);
                            this.submitPermissionsStatus = 400;
                            this.permissionsErrorMessage = error;
                        }
                    )
                }
                */
            },
            (error: ApiServiceError) => {
                console.log(error);
                this.submitMembershipStatus = 400;
                this.membershipErrorMessage = error;
            }
        );
    }

    setGroupsPermissions(userIri: string) {

        const projectAdmin: boolean = (!!this.selectedGroups.find(ad => ad.iri === KnoraConstants.ProjectAdminGroupIRI));

        if (projectAdmin) {
            this._usersService.addUserToProjectAdmin(userIri, this.selectedProject.iri).subscribe(
                (res: User) => {
                    this.submitPermissionsStatus = 1;
                },
                (error: ApiServiceError) => {
                    this.submitPermissionsStatus = 400;
                    this.permissionsErrorMessage = error;
                }
            );
        } else {
            this.submitPermissionsStatus = 1;
        }
    }

}
