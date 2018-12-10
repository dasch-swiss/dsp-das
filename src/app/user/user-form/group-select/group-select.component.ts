import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { ApiServiceError, AutocompleteItem, Group, GroupsService, KnoraConstants, PermissionData } from '@knora/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app-group-select',
    templateUrl: './group-select.component.html',
    styleUrls: ['./group-select.component.scss']
})
export class GroupSelectComponent implements OnInit {

    @Input() parentForm: FormGroup;

    // project iri
    @Input() projectIri: string;

    // users permissions from User data
    @Input() permissions: PermissionData;



    /*
    // default list of groups;
    defaultGroups: AutocompleteItem[] = [
        /!*
        {
            iri: KnoraConstants.ProjectMemberGroupIRI,
            name: 'Member'
        },
        *!/
        {
            iri: KnoraConstants.ProjectAdminGroupIRI,
            name: 'Administrator'
        }
    ];

    groupsList: AutocompleteItem[];

    usersDefaultGroup: string = KnoraConstants.ProjectMemberGroupIRI;
    selectedGroups: string[] = [this.usersDefaultGroup];


    // TODO: why do I have so much lists?
    // clean up: only one list of project specific permission`s groups = groupsList
    // all other lists can be inside of each method:
    // get project's groups, which expands the default groups = groupsList
    // and one list of user's groups

    constructor(private _groups: GroupsService) {
    }

    ngOnInit() {

        this.setGroupsList();
    }

    ngAfterViewInit() {
        this.selectUsersGroups(this.permissions);
    }

    // project has the following groups
    /!**
     * set the list of groups depending on the selected project
     *
     *!/
    setGroupsList() {

        // reset the list of groups and initialize it
        // with the default Knora groups (Member and Admin)
        this.groupsList = this.defaultGroups;

        // get all (additional) groups to select from list
        this._groups.getAllGroups()
            .subscribe(
                (result: Group[]) => {

                    for (const group of result) {
                        if (group.project.id === this.projectIri) {
                            this.groupsList.push({
                                iri: group.id,
                                name: group.name
                            });
                        }
                    }
                },
                (error: ApiServiceError) => {
                    console.error(error);
//                    this.errorMessage = <any> error;
                }
            );

    }


    //
    // user is in the following groups
    /!**
     * compare the membership of the selected user (from @Input)
     * with the selected project and select the user's groups
     *
     * @param perm
     *!/

    selectUsersGroups(perm: PermissionData) {

        const selectedGroups = [];

        // this.userRoleForm.controls['group'].reset(this.selectedGroups);

        if (perm.groupsPerProject[this.projectIri]) {
            // is the user a member of the project?
            // if true, get the permissions
            for (const p of perm.groupsPerProject[this.projectIri]) {

                this.groupsList.find(item => {
                    if (item.iri === p) {
                        selectedGroups.push(item.iri);
                    }
                    console.log(selectedGroups);
                    this.parentForm.controls['permission'].reset(selectedGroups);
                    return item.iri === p;
                });
            }


        } else {
            // preselect member only
            // this.userRoleForm.controls['group'].reset([this.usersDefaultGroup]);
        }

    }*/

    loading = true;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = false;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    groupCtrl = new FormControl();
    filteredGroups: Observable<AutocompleteItem[]>;

    // user's groups
    groups: AutocompleteItem[] = [
        {
            iri: KnoraConstants.ProjectMemberGroupIRI,
            name: 'Member'
        }
    ];

    // all groups in this project;
    // init with default groups and add project specific groups on ngOnInit
    allGroups: AutocompleteItem[] = [
        {
            iri: KnoraConstants.ProjectMemberGroupIRI,
            name: 'Member'
        },
        {
            iri: KnoraConstants.ProjectAdminGroupIRI,
            name: 'Administrator'
        }
    ];

    @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

    constructor(private _groups: GroupsService) {

        this.setList();

        this.filteredGroups = this.groupCtrl.valueChanges.pipe(
            startWith(null),
            map((group: string | null) => group ? this._filter(group) : this.allGroups.slice()));
    }

    ngOnInit() {


    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our fruit
        if ((value || '').trim()) {
            // find value in label of allGroups
            // value.trim()
            // and add it to the user's groups (to send it later to the api)
            // this.groups.push(value.trim());
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }

        this.groupCtrl.setValue(null);
    }

    remove(group: AutocompleteItem): void {
        const index = this.groups.indexOf(group);

        if (index >= 0) {
            this.groups.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        // this.groups.push(event.option.viewValue);
        this.fruitInput.nativeElement.value = '';
        this.groupCtrl.setValue(null);
    }

    private _filter(value: string): AutocompleteItem[] {
        const filterValue = value.toLowerCase();

        return this.allGroups.filter(group => group.name.toLowerCase().indexOf(filterValue) === 0);
    }

    setList() {

        // get all (additional) groups to select from list
        this._groups.getAllGroups()
            .subscribe(
                (result: Group[]) => {

                    for (const group of result) {
                        if (group.project.id === this.projectIri) {
                            this.allGroups.push({
                                iri: group.id,
                                name: group.name
                            });
                            this.loading = false;
                        }
                    }
                },
                (error: ApiServiceError) => {
                    console.error(error);
//                    this.errorMessage = <any> error;
                }
            );

    }
}
