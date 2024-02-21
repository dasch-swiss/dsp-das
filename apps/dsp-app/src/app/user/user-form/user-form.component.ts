import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Constants, ReadUser, StringLiteral, UpdateUserRequest, User } from '@dasch-swiss/dsp-js';
import { UserApiService } from '@dasch-swiss/vre/shared/app-api';
import { RouteConstants } from '@dasch-swiss/vre/shared/app-config';
import { ProjectService } from '@dasch-swiss/vre/shared/app-helper-services';
import { NotificationService } from '@dasch-swiss/vre/shared/app-notification';
import {
  AddUserToProjectMembershipAction,
  CreateUserAction,
  LoadUsersAction,
  ProjectsSelectors,
  SetUserAction,
  UserSelectors,
} from '@dasch-swiss/vre/shared/app-state';
import { UserEditService } from '@dsp-app/src/app/user/user-form/user-edit.service';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { combineLatest, Observable, Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { AppGlobal } from '../../app-global';
import { existingNamesAsyncValidator } from '../../main/directive/existing-name/existing-names.validator';
import { CustomRegex } from '../../workspace/resource/values/custom-regex';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  providers: [UserEditService], // Provide the service here
})
export class UserFormComponent implements OnInit {
  user!: ReadUser;

  userForm: UntypedFormGroup;
  /**
   * if the form was built to add new user to project,
   * we get a project uuid and a name (e-mail or username)
   * from the "add-user-autocomplete" input
   */
  // Todo: Remove inputs and set as query parmas
  projectUuid!: string;
  name?: string;

  submitting = false; // whether the form is currently submitting
  title: string;
  subtitle: string;

  // whether the user which is edited/created has system admin permission
  sysAdminPermission = false;

  usernameMinLength = 4;

  /**
   * error checking on the following fields
   */
  formErrors = {
    givenName: '',
    familyName: '',
    email: '',
    username: '',
  };

  /**
   * error hints
   */
  validationMessages = {
    givenName: {
      required: 'First name is required.',
    },
    familyName: {
      required: 'Last name is required.',
    },
    email: {
      required: 'Email address is required.',
      pattern: "This doesn't appear to be a valid email address.",
      existingName: 'This user exists already. If you want to edit it, ask a system administrator.',
      member: 'This user is already a member of the project.',
    },
    username: {
      required: 'Username is required.',
      pattern: 'Spaces and special characters are not allowed in username',
      minlength: `Username must be at least ${this.usernameMinLength} characters long.`,
      existingName: 'This user exists already. If you want to edit it, ask a system administrator.',
      member: 'This user is already a member of the project.',
    },
  };

  languagesList: StringLiteral[] = AppGlobal.languagesList;

  // whether the user who is editing is a system admin or not - used to show/hide the system admin checkbox
  @Select(UserSelectors.isSysAdmin) isSysAdmin$: Observable<boolean>;

  editExisting = false; // whether the user is being edited or created

  private _destroy$ = new Subject<void>();

  constructor(
    private _userApiService: UserApiService,
    private _formBuilder: UntypedFormBuilder,
    private _projectService: ProjectService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _store: Store,
    private _actions$: Actions,
    private _cd: ChangeDetectorRef,
    private _userEditService: UserEditService
  ) {}

  ngOnInit() {
    this._userEditService.user$.pipe(takeUntil(this._destroy$)).subscribe((user: ReadUser) => {
      this.user = user;
      // if a user id is set, we're editing an existing user, otherwise we're creating a new one
      this.editExisting = !!user.id;
      this.title = this.user.username || '';
      this.subtitle = "'appLabels.form.user.title.edit' | translate";
      this._buildForm(this.user);
      this._cd.markForCheck();
    });
  }

  /**
   * build the whole form
   *
   */
  private _buildForm(user: ReadUser) {
    // get info about system admin permission
    if (this.editExisting && user.permissions.groupsPerProject[Constants.SystemProjectIRI]) {
      // this user is member of the system project. does he has admin rights?
      this.sysAdminPermission = user.permissions.groupsPerProject[Constants.SystemProjectIRI].includes(
        Constants.SystemAdminGroupIRI
      );
    }

    this.userForm = this._formBuilder.group({
      givenName: new UntypedFormControl(
        {
          value: user.givenName,
          disabled: false,
        },
        [Validators.required]
      ),
      familyName: new UntypedFormControl(
        {
          value: user.familyName,
          disabled: false,
        },
        [Validators.required]
      ),
      email: new UntypedFormControl(
        {
          value: user.email,
          disabled: this.editExisting,
        },
        {
          validators: [Validators.required, Validators.pattern(CustomRegex.EMAIL_REGEX)],
          asyncValidators: [existingNamesAsyncValidator(this._userEditService.existingUserEmails$)],
        }
      ),
      username: new UntypedFormControl(
        {
          value: user.username,
          disabled: this.editExisting,
        },
        {
          validators: [
            Validators.required,
            Validators.minLength(this.usernameMinLength),
            Validators.pattern(CustomRegex.USERNAME_REGEX),
          ],
          asyncValidators: [existingNamesAsyncValidator(this._userEditService.existingUserNames$)],
        }
      ),
      password: new UntypedFormControl({
        value: '',
        disabled: this.editExisting,
      }),
      lang: new UntypedFormControl({
        value: user.lang ? user.lang : 'en',
        disabled: false,
      }),
      status: new UntypedFormControl({
        value: user.status ? user.status : true,
        disabled: this.editExisting,
      }),
      systemAdmin: new UntypedFormControl({
        value: this.sysAdminPermission,
        disabled: this.editExisting,
      }),
    });

    this.userForm.valueChanges.subscribe(() => this._validateForm());
  }

  private _validateForm() {
    // check if the form is valid
    Object.keys(this.formErrors).forEach(field => {
      this.formErrors[field] = '';
      const control = this.userForm.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        Object.keys(control.errors).forEach(key => {
          this.formErrors[field] += `${messages[key]} `;
        });
      }
    });
  }

  // get password from password form and send it to user form
  getPassword(pw: string) {
    this.userForm.controls.password.setValue(pw);
  }

  submitData(): void {
    this.submitting = true;

    if (this.editExisting) {
      this._editExistingUser();
    } else {
      this._createNewUser();
    }
  }

  private _editExistingUser(): void {
    // update an existing users data
    const user: ReadUser = new ReadUser();
    user.familyName = this.userForm.value.familyName;
    user.givenName = this.userForm.value.givenName;
    user.lang = this.userForm.value.lang;
    this._userEditService.updateUser(user);
  }

  private _createNewUser(): void {
    const user: User = new User();
    user.username = this.userForm.value.username;
    user.familyName = this.userForm.value.familyName;
    user.givenName = this.userForm.value.givenName;
    user.email = this.userForm.value.email;
    user.password = this.userForm.value.password;
    user.systemAdmin = this.userForm.value.systemAdmin;
    user.status = this.userForm.value.status;
    user.lang = this.userForm.value.lang;

    this._userEditService.createUser(user);
  }
  onCancel() {
    this._router.navigate(['../../'], { relativeTo: this._route });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
