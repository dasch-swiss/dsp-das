import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-lorem-ipsum',
    templateUrl: './lorem-ipsum.component.html',
    styleUrls: ['./lorem-ipsum.component.scss']
})
export class LoremIpsumComponent implements OnInit {

    /**
     * attribute to set the language
     * star-trek, esperanto
     * default value is latin
     */
    @Input() lang: string;

    constructor() {
    }

    ngOnInit() {

    }

}
