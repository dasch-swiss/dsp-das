import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-ontology',
    templateUrl: './ontology.component.html',
    styleUrls: ['./ontology.component.scss']
})
export class OntologyComponent implements OnInit {

    constructor(private _titleService: Title) {

        // set the page title
        this._titleService.setTitle('Ontology Editor');
    }

    ngOnInit() {
    }

}
