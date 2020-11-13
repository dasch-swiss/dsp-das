import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

    @Input() status: number;

    constructor(
        private _titleService: Title,
        private _route: ActivatedRoute
    ) {

    }

    ngOnInit() {

        if (!this.status) {
            this._route.data.subscribe(data => {
                this.status = data.status;
            });
        }

        // set the page title
        this._titleService.setTitle('DSP | Error ' + this.status);

    }

    reload() {
        window.location.reload();
    }

}
