import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    constructor(private _titleService: Title) {

        // set the page title
        this._titleService.setTitle('Login');
    }

    ngOnInit() {
    }

}
