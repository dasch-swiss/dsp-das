import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiResponseData, ApiResponseError, ChildNodeInfoResponse, KnoraApiConnection, List, ListInfoResponse, ListNodeInfo, ListNodeInfoResponse, ReadProject, StringLiteral, UpdateChildNodeRequest, UpdateListInfoRequest } from '@dasch-swiss/dsp-js';
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

    @Output() updateParent: EventEmitter<{ title: string }> = new EventEmitter<{ title: string }>();

    project: ReadProject;

    list: ListNodeInfo;

    labels: StringLiteral[];
    comments: StringLiteral[];

    /**
     * by adding new list, it starts with the list info and the next section is "creating the list";
     * true after adding list
     *
     */
    createList: boolean = false;
    newList: List;

    nameMinLength = 3;
    nameMaxLength = 16;

    /**
     * form group for the form controller
     */
    form: FormGroup;

    /**
     * error checking on the following fields
     */
    formErrors = {
        label: ''
    };

    /**
     * error hints
     */
    validationMessages = {
        label: {
            'required': 'Name is required.',
            'minlength': 'Name must be at least ' + this.nameMinLength + ' characters long.',
            'maxlength': 'Name cannot be more than ' + this.nameMaxLength + ' characters long.'
        }
    };


    /**
     * in case of an API error
     */
    errorMessage: any;

    saveButtonDisabled = false;

    constructor(@Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection) { }

    ngOnInit(): void {
        this.loading = true;

        // edit mode, get list
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

        this.loading = true;
        this.labels = [];
        this.comments = [];

        if (list && list.id) {
            this.labels = list.labels;
            this.comments = list.comments;
        }

        setTimeout(() => {
            this.loading = false;
        });
    }

    submitData() {

        // edit mode: update list info
        console.log('list: ', this.list);
        const childNodeUpdateData: UpdateChildNodeRequest = new UpdateChildNodeRequest();
        childNodeUpdateData.projectIri = this.projectIri;
        childNodeUpdateData.listIri = this.iri;
        childNodeUpdateData.labels = this.labels;
        childNodeUpdateData.comments = this.comments.length > 0 ? this.comments : undefined;

        console.log('childNodeUpdateData: ', childNodeUpdateData);

        this._dspApiConnection.admin.listsEndpoint.updateChildNode(childNodeUpdateData).subscribe(
            (response: ApiResponseData<ChildNodeInfoResponse>) => {
                // this.success = true;
                this.loading = false;
                this.closeDialog.emit(response.body.nodeinfo);
            },
            (error: ApiResponseError) => {
                console.log('ERROR NODE UPDATE');
                this.errorMessage = error;
                this.loading = false;
                // this.success = false;
            }
        );
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
            // error, don't let user submit
            // show error message
            this.saveButtonDisabled = true;
        } else {
            this.saveButtonDisabled = false;
        }
    }

}
