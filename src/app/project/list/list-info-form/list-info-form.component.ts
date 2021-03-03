import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    ApiResponseData,
    ApiResponseError,
    CreateListRequest,
    KnoraApiConnection,
    List,
    ListInfoResponse,
    ListNodeInfo,
    ListResponse,
    ReadProject,
    StringLiteral,
    UpdateListInfoRequest
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-list-info-form',
    templateUrl: './list-info-form.component.html',
    styleUrls: ['./list-info-form.component.scss']
})
export class ListInfoFormComponent implements OnInit {

    loading: boolean;

    @Input() iri?: string;

    @Input() mode: 'create' | 'edit';

    // project short code
    @Input() projectcode: string;

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
            'required': 'Label is required.',
            'minlength': 'Label must be at least ' + this.nameMinLength + ' characters long.',
            'maxlength': 'Label cannot be more than ' + this.nameMaxLength + ' characters long.'
        }
    };

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService
    ) { }

    ngOnInit() {

        this.loading = true;

        // get list info in case of edit mode
        if (this.mode === 'edit') {
            // edit mode, get list
            this._dspApiConnection.admin.listsEndpoint.getListInfo(this.iri).subscribe(
                (response: ApiResponseData<ListInfoResponse>) => {
                    this.list = response.body.listinfo;
                    this.buildForm(response.body.listinfo);
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );

        } else {
            // build the form
            this.buildForm();
        }
    }

    buildForm(list?: ListNodeInfo): void {

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

    submitData(): void {
        this.loading = true;

        // create array of labels from the form
        const labels = new Array<StringLiteral>();
        let i = 0;
        for (const l of this.labels) {
            labels[i] = new StringLiteral();
            labels[i].language = l.language;
            labels[i].value = l.value;
            i++;
        }

        // create array of comments from the form
        const comments = new Array<StringLiteral>();
        let j = 0;
        for (const c of this.comments) {
            comments[j] = new StringLiteral();
            comments[j].language = c.language;
            comments[j].value = c.value;
            j++;
        }

        if (this.mode === 'edit') {
            // edit mode: update list info
            const listInfoUpdateData: UpdateListInfoRequest = new UpdateListInfoRequest();
            listInfoUpdateData.projectIri = this.projectIri;
            listInfoUpdateData.listIri = this.iri;
            listInfoUpdateData.labels = this.labels;
            listInfoUpdateData.comments = this.comments;

            console.log('comments: ', comments);
            console.log('this.comments: ', this.comments);

            this._dspApiConnection.admin.listsEndpoint.updateListInfo(listInfoUpdateData).subscribe(
                (response: ApiResponseData<ListInfoResponse>) => {
                    this.loading = false;
                    this.closeDialog.emit(response.body.listinfo);
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                    this.loading = false;
                }
            );

        } else {
            // new: create list
            const listInfoData: CreateListRequest = new CreateListRequest();
            listInfoData.projectIri = this.projectIri;
            listInfoData.labels = labels;
            listInfoData.comments = comments;

            this._dspApiConnection.admin.listsEndpoint.createList(listInfoData).subscribe(
                (response: ApiResponseData<ListResponse>) => {
                    this.newList = response.body.list;

                    this.updateParent.emit({ title: response.body.list.listinfo.labels[0].value + ' (' + response.body.list.listinfo.labels[0].language + ')' });
                    this.loading = false;
                    this.createList = true;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                    this.loading = false;
                }
            );
        }
    }

    /**
     * Reset the form
     */
    resetForm(ev: Event, list?: ListNodeInfo) {

        ev.preventDefault();

        list = list ? list : new ListNodeInfo();

        this.buildForm(list);
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
    }

}
