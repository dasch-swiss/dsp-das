import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    constructor(private _titleService: Title) {
        // set the page title
        this._titleService.setTitle('Knora User Interface | Research Layer');
    }
}
