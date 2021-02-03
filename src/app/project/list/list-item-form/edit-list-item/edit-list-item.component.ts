import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ApiResponseData, ApiResponseError, ChildNodeInfoResponse, KnoraApiConnection, List, ListNodeInfo, ListNodeInfoResponse, StringLiteral, UpdateChildNodeRequest } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';

@Component({
  selector: 'app-edit-list-item',
  templateUrl: './edit-list-item.component.html',
  styleUrls: ['./edit-list-item.component.scss']
})
export class EditListItemComponent implements OnInit {
    loading: boolean;

    @Input() iri: string;

    @Input() projectIri: string;

    @Output() closeDialog: EventEmitter<List | ListNodeInfo> = new EventEmitter<List>();

    list: ListNodeInfo;

    labels: StringLiteral[];
    comments: StringLiteral[];

    /**
     * error checking on the following fields
     */
    formErrors = {
        label: {
            'required': 'A label is required.'
        }
    };

    /**
     * in case of an API error
     */
    errorMessage: any;

    saveButtonDisabled = false;

    formInvalidMessage: string;

    constructor(@Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection) { }

    ngOnInit(): void {
        this.loading = true;

        // get list
        this._dspApiConnection.admin.listsEndpoint.getListNodeInfo(this.iri).subscribe(
            (response: ApiResponseData<ListNodeInfoResponse>) => {
                this.list = response.body.nodeinfo;
                this.buildForm(response.body.nodeinfo);
            },
            (error: ApiResponseError) => {
                console.error(error);
            }
        );
    }

    buildForm(list: ListNodeInfo): void {

        this.labels = [];
        this.comments = [];

        if (list && list.id) {
            this.labels = list.labels;
            this.comments = list.comments;
        }

        this.loading = false;
    }

    handleData(data: StringLiteral[], type: string) {
        switch (type) {
            case 'labels':
                this.labels = data;
                break;

            case 'comments':
                this.comments = data;
                break;
        }

        if (this.labels.length === 0) {
            // invalid form, don't let user submit
            this.saveButtonDisabled = true;
            this.formInvalidMessage = this.formErrors.label.required;
        } else {
            this.saveButtonDisabled = false;
            this.formInvalidMessage = null;
        }
    }

    updateChildNode() {

        const childNodeUpdateData: UpdateChildNodeRequest = new UpdateChildNodeRequest();
        childNodeUpdateData.projectIri = this.projectIri;
        childNodeUpdateData.listIri = this.iri;
        childNodeUpdateData.labels = this.labels;
        childNodeUpdateData.comments = this.comments.length > 0 ? this.comments : [];

        this._dspApiConnection.admin.listsEndpoint.updateChildNode(childNodeUpdateData).subscribe(
            (response: ApiResponseData<ChildNodeInfoResponse>) => {
                this.loading = false;
                this.closeDialog.emit(response.body.nodeinfo);
            },
            (error: ApiResponseError) => {
                this.errorMessage = error;
                this.loading = false;
            }
        );
    }

}
