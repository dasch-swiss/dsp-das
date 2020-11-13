import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

    @Input() status?: number = 404;

    constructor(
        private _titleService: Title,
        private _route: ActivatedRoute
    ) {
        this._route.data.subscribe(data => {
            console.log(data);
            // this.status = data.status;
        });
    }

    ngOnInit() {
        // set the page title
        this._titleService.setTitle('DSP | Error ' + this.status);
    }

    reload() {
        // TODO: activate as soon the error handling is
        // implemented (ak)
        // window.location.reload();
    }

}
