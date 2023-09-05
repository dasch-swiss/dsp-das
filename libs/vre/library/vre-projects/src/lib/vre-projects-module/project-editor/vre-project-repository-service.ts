import {
    Inject, Injectable
} from '@angular/core';
import {
    UntypedFormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
    ApiResponseData, ApiResponseError,
    KnoraApiConnection, ProjectResponse, StringLiteral
} from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/vre/shared/app-config';
import { AppErrorHandler } from '@dasch-swiss/vre/shared/app-error-handler';
import { NotificationService} from "@dasch-swiss/vre/shared/app-notification";
import { SessionService} from "@dasch-swiss/vre/shared/app-session";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReadProject } from '@dasch-swiss/dsp-js/src/models/admin/read-project';
import {FormControlType, DspFormControlFactory} from "../../../../../vre-forms/src/lib/vre-forms-module/vre-forms";

export class NewProject {
    readonly _id: string;
    private _shortCode: string;
    private _shortName: string;
    private _longName: string;
    private _descriptions: StringLiteral[];
    private _disabled: boolean;
    private _keywords: string[];
    private _logo: string;
    public dspFormControlDefs: FormControlType[] = [];

    constructor(readProject: ReadProject) {
        this._id = readProject.id;
        this._shortName = readProject.shortname;
        this._longName = readProject.longname;
        this._shortCode = readProject.shortcode;
        this._descriptions = readProject.description;
        this._disabled = !readProject.status;
        this._keywords = readProject.keywords;
        this._logo = readProject.logo;

        const factory = new DspFormControlFactory();
        factory.textForm('shortcode')
            .withValue(this._shortCode)
            .withDisabled()
            .withRequired(true)
            .withPattern('^[0-9A-Fa-f]+$')
            .withMinLength(4)
            .withMaxLength(4)
            .withFormSize('small-field');

        factory.textForm('shortname')
            .withPattern('^[a-zA-Z]+\\S*$')
            .withMinLength(3)
            .withMaxLength(16)
            .withFormSize('medium-field')
            .withValue(this._shortName)
            .withDisabled()
            .withRequired(true);

        factory.textForm('longName')
            .withValue(this._longName)
            .withFormSize('large-field')
            .withMultipleCardinality();

        factory.boolForm('a boolean', false)
            .withoutValue()

        this.dspFormControlDefs = factory.getFormControlDefs();
    }

    get id() {
        return this._id;
    }

    get shortCode() {
        return this._shortCode;
    }

    get shortName() {
        return this._shortName;
    }

    get longName() {
        return this._longName;
    }

    get logo() {
        return this._logo;
    }

    get exists() {
        return !!this._id;
    }

    get descriptions() {
        return this._descriptions;
    }

    set descriptions(value: StringLiteral[]) {
        this._descriptions = value;
    }

    get disabled() {
        return this._disabled;
    }
}

@Injectable({
    providedIn: 'root',
})
export class VreProjectRepositoryService {

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _errorHandler: AppErrorHandler
    ) {
    }

    getProject(projectIri: string): Observable<NewProject> {
        return this._dspApiConnection.admin.projectsEndpoint.getProjectByIri(projectIri).pipe(
            map((response: ApiResponseData<ProjectResponse>) => {
                 return new NewProject(response.body.project);
            },
                (error: ApiResponseError) => {
                    this._errorHandler.showMessage(error);
                })
        );
    }

    setProject(project: NewProject) {
        // store
        console.log(project);
    }

    /**
     * delete a project
     * @param id Project Iri
     */
    delete(id: string) {
        console.log('delete');
    }

    /**
     * activate already deleted project
     *
     * @param id Project Iri
     */
    activate(id: string) {
        console.log('activate');
    }

    /**
     * deActivate a project
     *
     * @param id Project Iri
     */
    deActivate(id: string) {
        console.log('deActivate');
    }
}
