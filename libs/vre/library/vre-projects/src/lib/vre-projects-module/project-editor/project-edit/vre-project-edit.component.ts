import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { NewProject, VreProjectRepositoryService } from '../vre-project-repository-service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'vre-app-project-edit',
    templateUrl: './vre-project-edit.component.html'
})
export class VreProjectEditComponent implements OnInit {

    /**
     * the iri of an existing project to edit
     */
    @Input() projectIri: string;

    // when editing is canceled
    @Output() cancel = new EventEmitter<void>();

    separatorKeyCodes = [ENTER, COMMA];

    project: NewProject;

    constructor(
        private _projectRepoService: VreProjectRepositoryService,
        ) {
        console.log('VreProjectEditComponent constructor')
    }

    ngOnInit() {
        this._projectRepoService.getProject(this.projectIri).subscribe(p => {
            this.project = p;
        });
    }

    onCancel() {
        this.cancel.emit();
    }

    onSubmit(formGroup: FormGroup) {
        // toDo: update project to writeProject or whatever
        this._projectRepoService.setProject(this.project)
    }
}

