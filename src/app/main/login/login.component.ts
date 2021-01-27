import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionService } from '@dasch-swiss/dsp-ui';
import { ComponentCommunicationEventService, EmitEvent, Events } from 'src/app/main/services/component-communication-event.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    returnUrl: string;

    constructor (private _titleService: Title,
        private _route: ActivatedRoute,
        private _router: Router,
        private _session: SessionService,
        private _componentCommsService: ComponentCommunicationEventService) {

        // set the page title
        this._titleService.setTitle('Login');

        this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';
    }

    ngOnInit() {
    }

    refresh() {
        // check if a session is active
        if (this._session.getSession()) {
            this._router.navigate(['dashboard']);
        }
    }

    // TO REPLACE THE METHOD ABOVE ONCE WE WILL USE DSP-APP AS A RESEARCH PLATFORM AGAIN
    /* refresh(status: boolean) {

        // go to previous route:
        if (status) {
            this._router.navigate([this.returnUrl]);
            this._componentCommsService.emit(new EmitEvent(Events.LoginSuccess, true));
        }
    } */

}
