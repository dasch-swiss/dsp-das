import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AutocompleteItem } from '@knora/core';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-user-add',
    templateUrl: './user-add.component.html',
    styleUrls: ['./user-add.component.scss']
})
export class UserAddComponent implements OnInit {

    /**
     * status for the progress indicator
     */
    loading: boolean = true;

    /**
     * project name to get existing team members
     * or to know where to add selected user
     */
    @Input() projectName: string;

    /**
     * event emitter, when the selected user will be added to the list
     */
    @Output() userAdded: EventEmitter<any> = new EventEmitter<any>();

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
            'required': 'Email address is required.',
            'pattern': 'This doesn\'t appear to be a valid email address.',
            'existingName': 'This user is already a member of the project. You can\'t add him.'
        }
    };

    /**
     * list of all users
     */
    users: AutocompleteItem[] = [];

    /**
    * filter users while typing (autocomplete)
    */
    filteredUsers: Observable<any>;

    /**
     * list of usernames to prevent duplicate entries
     */
    existingUsernames: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];

    /**
     * list of emails to prevent duplicate entries
     */
    existingEmails: [RegExp] = [
        new RegExp('anEmptyRegularExpressionWasntPossible')
    ];

    /**
     * member status of selected user
     */
    isAlreadyMember = false;

    constructor() {
    }

    ngOnInit() {
    }

}
