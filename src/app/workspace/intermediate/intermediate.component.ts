import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import {
    ApiResponseError,
    Constants,
    CreateLinkValue,
    CreateResource,
    CreateTextValueAsString,
    KnoraApiConnection,
    ReadResource
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken, FilteredResouces } from '@dasch-swiss/dsp-ui';
import { ErrorHandlerService } from 'src/app/main/error/error-handler.service';

@Component({
    selector: 'app-intermediate',
    templateUrl: './intermediate.component.html',
    styleUrls: ['./intermediate.component.scss']
})
export class IntermediateComponent implements OnInit {

    @Input() resources: FilteredResouces;

    @Output() action: EventEmitter<string> = new EventEmitter<string>();

    // i18n plural mapping
    itemPluralMapping = {
        resource: {
            '=1': 'Resource',
            other: 'Resources'
        }
    };

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: ErrorHandlerService,
    ) { }

    ngOnInit(): void { }

    /**
     * create a link resource from selected resources
     * @param resources
     */
    linkResources(resources: FilteredResouces) {

        // step 1: open dialog box with form to define label and comment


        // step 2: submit link resource
        const linkObj = new CreateResource();

        // --> TODO: will be replaced by label input from form value
        linkObj.label = 'Label from link resource form: input';

        linkObj.type = Constants.KnoraApiV2 + Constants.HashDelimiter + 'LinkObj';

        linkObj.attachedToProject = 'http://rdfh.ch/projects/1111';

        const propertyValues = [];
        const hasComment = [];
        // hasComment[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasComment'] = [];
        const hasLinkToValue = [];
        // hasLinkToValue[Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue'] = [];
        resources.resIds.forEach(id => {
            const linkVal = new CreateLinkValue();
            linkVal.type = Constants.LinkValue;
            linkVal.linkedResourceIri = id;
            // the value could have a comment
            // linkVal.valueHasComment = 'comment from link res form?';

            hasLinkToValue.push(linkVal);
        });

        // --> TODO: will be replaced by comment input from form value
        const comment = 'Comment from link resource form: textarea';
        if (comment) {
            const commentVal = new CreateTextValueAsString();
            commentVal.type = Constants.TextValue;
            commentVal.text = comment;
            hasComment.push(commentVal);
        }

        linkObj.properties = {
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasLinkToValue']: hasLinkToValue,
            [Constants.KnoraApiV2 + Constants.HashDelimiter + 'hasComment']: hasComment,
        };


        this._dspApiConnection.v2.res.createResource(linkObj).subscribe(
            (response: ReadResource) => {
                // --> TODO: do something with the successful response
            },
            (error: ApiResponseError) => {
                this._errorHandler.showMessage(error);
            }
        );

    }

}
