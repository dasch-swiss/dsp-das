import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Group, Project, GroupsService, ProjectsService } from '@knora/core';

@Component({
  selector: 'app-group-form',
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.scss']
})
export class GroupFormComponent implements OnInit {

  @Input() projectcode: string;

  @Input() projectIri: string;

  @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

  /**
   * group data
   */
  group: Group;

  project: Project;

  /**
    * form group for the form controller
    */
  form: FormGroup;

  loading: boolean = false;

  errorMessage: any;

  /**
    * success of sending data
    */
  success = false;

  /**
    * message after successful post
    */
  successMessage: any = {
    status: 200,
    statusText: "You have successfully updated group's info."
  };

  constructor(
    private _groupsService: GroupsService,
    private _projectService: ProjectsService,
    private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.buildForm(this.group);

    this._projectService.getProjectByIri(this.projectIri).subscribe(
      (projectData: Project) => {
        this.project = projectData;
      }
    )
  }

  buildForm(group?: Group): void {
    /* TODO: pass Project object or projectIRI but then another Group class must be created */
    this.form = this._formBuilder.group({
      groupName: new FormControl(
        {
          value: '',
          disabled: false
        },
        [Validators.required]
      ),
      groupDescription: new FormControl(
        {
          value: '',
          disabled: false
        }
      ),
      'status': [true],
      'selfjoin': [false]
    });
  }

  submitData() {
    console.log('submit data');
    this.closeMessage();
  }

  closeMessage() {
    this.closeDialog.emit(this.group);
  }
}
