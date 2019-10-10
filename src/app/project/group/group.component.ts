import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Session } from '@knora/authentication';
import { Group, Project, ProjectsService, ApiServiceError, GroupsService, AutocompleteItem } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';
import { GroupFormComponent } from './group-form/group-form.component';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { KuiMessageData } from '@knora/action';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {

  // loading for progess indicator
  loading: boolean;

  // permissions of logged-in user
  session: Session;
  sysAdmin: boolean = false;
  projectAdmin: boolean = false;

  // project shortcode; as identifier in project cache service
  projectcode: string;

  // project data
  project: Project;

  // project members
  projectGroups: Group[] = [];

  // short message to indicate that no group has been defined for the project
  errorMessageNoGroup: KuiMessageData = {
    status: 200,
    statusMsg: 'Success',
    statusText: 'No group has been defined in this project.',
    type: 'Note',
    footnote: 'Close it'
  };

  @ViewChild('groupFormComponent', { static: false }) groupForm: GroupFormComponent;

  constructor(
    private _dialog: MatDialog,
    private _cache: CacheService,
    private _groupsService: GroupsService,
    private _projectsService: ProjectsService,
    private _route: ActivatedRoute,
    private _titleService: Title) {
    // get the shortcode of the current project
    this._route.parent.paramMap.subscribe((params: Params) => {
      this.projectcode = params.get('shortcode');
    });

    // set the page title
    this._titleService.setTitle('Project ' + this.projectcode + ' | Permission Groups');
  }

  ngOnInit() {

    // get information about the logged-in user
    this.session = JSON.parse(localStorage.getItem('session'));
    // is the logged-in user system admin?
    this.sysAdmin = this.session.user.sysAdmin;

    // default value for projectAdmin
    this.projectAdmin = this.sysAdmin;

    // set the cache
    this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode));

    // get the project data from cache
    this._cache.get(this.projectcode, this._projectsService.getProjectByShortcode(this.projectcode)).subscribe(
      (result: Project) => {
        this.project = result;

        // is logged-in user projectAdmin?
        this.projectAdmin = this.sysAdmin ? this.sysAdmin : this.session.user.projectAdmin.some(e => e === this.project.id);

        this.initList();

        this.loading = false;
      },
      (error: ApiServiceError) => {
        console.error(error);
        this.loading = false;
      }
    );
  }

  /**
     * build the list of lists
     */
  initList() {
    this._groupsService.getAllGroups().subscribe(
      (response: Group[]) => {
        for (const group of response) {
          if (group.project.id === this.project.id) {
            this.projectGroups = [group];
            this.loading = false;
          } else {
            this.loading = false;
          }
        }
      },
      (error: any) => {
        console.error(error);
      }
    );

  }

  /**
    * refresh list of members after adding a new user to the team
    */
  refresh(): void {
    // referesh the component
    this.loading = true;
    // update the cache
    this._cache.del('members_of_' + this.projectcode);

    this.initList();

    // refresh child component: add group
    if (this.groupForm) {
      this.groupForm.buildForm();
    }
  }

  /**
    * open dialog in every case of modification:
    * edit group data, remove group from project etc.
    *
    */
  openDialog(mode: string, name: string, iri?: string): void {
    const dialogConfig: MatDialogConfig = {
      width: '640px',
      position: {
        top: '112px'
      },
      data: { mode: mode, title: name, id: iri, project: this.project.id }
    };

    const dialogRef = this._dialog.open(
      DialogComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe(result => {
      // update the view
      this.refresh();
    });
  }

}
