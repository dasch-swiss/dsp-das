import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-error',
    templateUrl: './error.component.html',
    styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

    @Input() status?: number = 404;

    constructor(private _titleService: Title) {

    }

    ngOnInit() {
        // set the page title
        this._titleService.setTitle('DSP | Error ' + this.status);
    }

    reload() {
        window.location.reload();
    }
}
