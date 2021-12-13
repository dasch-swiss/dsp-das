import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-permission-form',
    templateUrl: './permission-form.component.html',
    styleUrls: ['./permission-form.component.scss']
})
export class PermissionFormComponent implements OnInit {

    @Input() permissionsString: string;

    loading: boolean;

    permissionsForm: FormGroup;

    permissions: string;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.permissions = this.permissionsString ? this.permissionsString : undefined;

        console.log('permissions: ', this.permissions);

        this.permissionsForm = this._fb.group({
            permission: this.permissions
        });

        this.permissionsForm.valueChanges.subscribe(() => this.onValueChanged());
    }

    onValueChanged() {
        this.permissions = this.permissionsForm.get('permission').value;
        console.log('permissions: ', this.permissions);
    }

    updatePermissions() {
        console.log('updating permissions: ', this.permissions);
    }
}
