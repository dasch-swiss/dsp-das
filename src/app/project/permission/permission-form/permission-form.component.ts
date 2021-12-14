import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiResponseError, KnoraApiConnection, ReadResource, UpdateResourceMetadata, UpdateResourceMetadataResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-permission-form',
    templateUrl: './permission-form.component.html',
    styleUrls: ['./permission-form.component.scss']
})
export class PermissionFormComponent implements OnInit {

    @Input() resource: ReadResource;

    loading: boolean;

    permissions: FormControl;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _fb: FormBuilder
    ) { }

    ngOnInit(): void {

        this.permissions = new FormControl(this.resource.hasPermissions);

        this.permissions.valueChanges.subscribe(() => this.onValueChanged());
    }

    onValueChanged() {
        console.log('permission: ', this.permissions.value);
    }

    updatePermissions() {
        console.log('updating permission: ', this.permissions.value);
        this.loading = true;
        const updateResourceMetadata = new UpdateResourceMetadata();

        updateResourceMetadata.id = this.resource.id;
        updateResourceMetadata.type = this.resource.type;
        updateResourceMetadata.lastModificationDate = this.resource.lastModificationDate;
        updateResourceMetadata.hasPermissions = this.permissions.value;
        console.log('updateResourceMetadata: ', updateResourceMetadata);
        this._dspApiConnection.v2.res.updateResourceMetadata(updateResourceMetadata).subscribe(
            (res: UpdateResourceMetadataResponse) => {
                console.log('res: ', res);
                this.resource.lastModificationDate = res.lastModificationDate;
                this.loading = false;
            },
            (error: ApiResponseError) => {
                this.loading = false;
                this._errorHandler.showMessage(error);
            }
        );
    }
}
