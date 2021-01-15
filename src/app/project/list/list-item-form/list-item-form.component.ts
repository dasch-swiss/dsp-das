import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
    ApiResponseData,
    ApiResponseError,
    CreateChildNodeRequest,
    KnoraApiConnection,
    ListNodeInfo,
    ListNodeInfoResponse,
    StringLiteral,
    UpdateChildNodeLabelsRequest
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { DialogComponent } from 'src/app/main/dialog/dialog.component';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-list-item-form',
    templateUrl: './list-item-form.component.html',
    styleUrls: ['./list-item-form.component.scss'],
    animations: [
        // the fade-in/fade-out animation.
        // https://www.kdechant.com/blog/angular-animations-fade-in-and-fade-out
        trigger('simpleFadeAnimation', [

          // the "in" style determines the "resting" state of the element when it is visible.
          state('in', style({opacity: 1})),

          // fade in when created.
          transition(':enter', [
            // the styles start from this point when the element appears
            style({opacity: 0}),
            // and animate toward the "in" state above
            animate(150)
          ]),

          // fade out when destroyed.
          transition(':leave',
            // fading out uses a different syntax, with the "style" being passed into animate()
            animate(150, style({opacity: 0})))
        ])
      ]
})
export class ListItemFormComponent implements OnInit {

    /**
     * node id, in case of edit item
     */
    @Input() iri?: string;

    /**
     * project shortcode
     */
    @Input() projectcode?: string;

    /**
     * project id
     */
    @Input() projectIri?: string;

    /**
     * parent node id
     */
    @Input() parentIri?: string;

    @Input() labels?: StringLiteral[];

    // set main / pre-defined language
    @Input() language?: string;

    @Output() refreshParent: EventEmitter<ListNodeInfo> = new EventEmitter<ListNodeInfo>();

    loading: boolean;

    initComponent: boolean;

    placeholder: string = 'Append item to ';

    /**
    * form group for the form controller
    */
    form: FormGroup;

    updateData: boolean = false;

    updateSuccessful: boolean = false;
    updateFailed: boolean = false;

    showActionBubble: boolean = false;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
        private _dialog: MatDialog
    ) { }

    ngOnInit() {

        this.initComponent = true;

        if (this.labels && this.labels.length > 0) {
            this.placeholder = 'Edit item ';
        }

        // it can be used in the input placeholder
        if (this.parentIri) {
            this._dspApiConnection.admin.listsEndpoint.getListNodeInfo(this.parentIri).subscribe(
                (response: ApiResponseData<ListNodeInfoResponse>) => {
                    this.placeholder += response.body.nodeinfo.labels[0].value;
                    this.initComponent = false;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }
    }

    submitData() {

        if (!this.labels.length) {
            return;
        }

        this.loading = true;

        if (this.iri && this.updateData) {
            // edit mode
            // TODO: update node method not yet implemented; Waiting for Knora API
            console.log(this.iri);
            const childLabels: UpdateChildNodeLabelsRequest = new UpdateChildNodeLabelsRequest();
            // initialize labels
            let i = 0;
            for (const l of this.labels) {
                childLabels.labels[i] = new StringLiteral();
                childLabels.labels[i].language = l.language;
                childLabels.labels[i].value = l.value;
                i++;
            }

            console.log('labels: ', childLabels.labels);

            // send payload to dsp-api's api
            this._dspApiConnection.admin.listsEndpoint.updateChildLabels(this.iri, childLabels).subscribe(
                (response: ApiResponseData<ListNodeInfoResponse>) => {
                    console.log('SUCCESS: ', response);
                    this.loading = false;
                    this.updateSuccessful = true;
                },
                (error: ApiResponseError) => {
                    console.error(error);
                    this.updateFailed = true;
                }
            );

            // TODO: remove setTimeout after testing position of progress indicator
            setTimeout(() => {
                this.loading = false;
            }, 500);

        } else {
            // generate the data payload
            const listItem: CreateChildNodeRequest = new CreateChildNodeRequest();
            listItem.parentNodeIri = this.parentIri;
            listItem.projectIri = this.projectIri;
            listItem.name = this.projectcode + '-' + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

            // initialize labels
            let i = 0;
            for (const l of this.labels) {
                listItem.labels[i] = new StringLiteral();
                listItem.labels[i].language = l.language;
                listItem.labels[i].value = l.value;
                i++;
            }
            listItem.comments = []; // TODO: comments are not yet implemented in the template

            // send payload to dsp-api's api
            this._dspApiConnection.admin.listsEndpoint.createChildNode(listItem).subscribe(
                (response: ApiResponseData<ListNodeInfoResponse>) => {
                    this.refreshParent.emit(response.body.nodeinfo);
                    this.loading = false;
                },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                }
            );
        }
    }

    handleData(data: StringLiteral[]) {
        // this shouldn't run on the init...
        if (!this.initComponent) {
            this.labels = data;
        }
    }

    toggleBtn(show: boolean) {
        this.updateFailed = false;
        this.updateSuccessful = false;
        this.updateData = show;
    }

    mouseEnter() {
        this.showActionBubble = true;
    }

    mouseLeave() {
        this.showActionBubble = false;
    }

    /**
    * open dialog in every case of modification:
    * edit list data, remove list from project etc.
    *
    */
   openDialog(mode: string, name: string, iri?: string): void {
    const dialogConfig: MatDialogConfig = {
        width: '640px',
        position: {
            top: '112px'
        },
        data: { mode: mode, title: name, id: iri, project: this.projectIri }
    };

    console.log('mode: ', mode);
    console.log('name: ', name);
    console.log('iri: ', iri);
    console.log('project: ', this.projectIri);

    const dialogRef = this._dialog.open(
        DialogComponent,
        dialogConfig
    );

    dialogRef.afterClosed().subscribe(() => {
        // update the view
        // this.initList();
    });
}
}
