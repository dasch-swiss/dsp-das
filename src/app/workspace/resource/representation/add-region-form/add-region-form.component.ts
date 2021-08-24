import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-add-region-form',
    templateUrl: './add-region-form.component.html',
    styleUrls: ['./add-region-form.component.scss']
})
export class AddRegionFormComponent implements OnInit {
    @Input() resourceIri: string;
    regionForm: FormGroup;
    colorPattern = '^#[a-f0-9]{6}$';
    constructor(private _dialogRef: MatDialogRef<AddRegionFormComponent>, private _fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.regionForm = this._fb.group({
            color: ['#ff3333', [Validators.required, Validators.pattern(this.colorPattern)]],
            comment: [null]
        });
    }
    submit(): void {
        this._dialogRef.close(this.regionForm.value);
    }

}
