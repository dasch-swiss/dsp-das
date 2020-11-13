import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ApiResponseData, ApiResponseError, HealthResponse, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspApiConnectionToken } from '@dasch-swiss/dsp-ui';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    apiErrorStatus: number;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _titleService: Title) {

        // set the page title
        this._titleService.setTitle('DaSCH Service Platform');

    }

    ngOnInit() {
        // test the api connection
        this._dspApiConnection.system.healthEndpoint.getHealthStatus().subscribe(
            (response: ApiResponseData<HealthResponse>) => {
                this.apiErrorStatus = undefined;
            },
            (error: ApiResponseError) => {
                const status = (error.status === 0 ? 503 : error.status);
                if (status >= 500 && status < 600) {
                    this.apiErrorStatus = status;
                    console.log('status', status)
                }
            }
        );

    }
}
