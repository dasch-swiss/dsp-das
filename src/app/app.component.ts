import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiResponseData, ApiResponseError, KnoraApiConnection, ProjectsResponse } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    session = false;

    noError:boolean = true;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _titleService: Title) {

        // set the page title
        this._titleService.setTitle('DSP | DaSCH\'s generic user interface');

    }

    ngOnInit() {
        // test the api connection
        this._dspApiConnection.admin.projectsEndpoint.getProjects().subscribe(
            (response: ApiResponseData<ProjectsResponse>) => {
                this.noError = true;
            },
            (error: ApiResponseError) => {
                const status = (error.status === 0 ? 503 : error.status);
                if (status >= 500 && status < 600) {
                    // this.noError = false;
                    console.warn('SERVER ERROR')
                }
            }
        );

    }
}
