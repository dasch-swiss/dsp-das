import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-attribution-tab-view',
    templateUrl: './attribution-tab-view.component.html',
    styleUrls: ['./attribution-tab-view.component.scss']
})
export class AttributionTabViewComponent implements OnInit {

    @Input() attribution: object;

    people = [{
        "address": {"addressLocality": "Basel", "postalCode": "4000", "streetAddress": "Teststrasse"},
        "email": "/benjamin.jones@test.ch",
        "familyName": "Jones",
        "givenName": "Benjamin",
        "jobTitle": "Dr. des.",
        "memberOf": "http://ns.dasch.swiss/test-dasch"
    }, {
        "address": {"addressLocality": "Basel", "postalCode": "4000", "streetAddress": "Teststrasse"},
        "email": "/james.coleman@dasch.swiss",
        "familyName": "Coleman",
        "givenName": "James",
        "jobTitle": "Dr. des.",
        "memberOf": "http://ns.dasch.swiss/test-dasch"
    }, {
        "address": {"addressLocality": "Basel", "postalCode": "4000", "streetAddress": "Teststrasse"},
        "email": "/lauren.berry@unibas.ch",
        "familyName": "Berry",
        "givenName": "Lauren",
        "jobTitle": "Dr.",
        "memberOf": "http://ns.dasch.swiss/test-dasch"
    }, {
        "address": {"addressLocality": "Basel", "postalCode": "4000", "streetAddress": "Teststrasse"},
        "email": "/leonhard.hart@test.ch",
        "familyName": "Hart",
        "givenName": "Leonhard",
        "jobTitle": "Prof.",
        "memberOf": "http://ns.dasch.swiss/test-dasch"
    },{
        "address": {"addressLocality": "Basel", "postalCode": "4000", "streetAddress": "Teststrasse"},
        "email": "/lauren.berry@unibas.ch",
        "familyName": "Berry",
        "givenName": "Lauren",
        "jobTitle": "Dr.",
        "memberOf": "http://ns.dasch.swiss/test-dasch"
    }];

    constructor() { }

    ngOnInit(): void {
    }

}
