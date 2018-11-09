import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    constructor(
        private _matIconRegistry: MatIconRegistry,
        private _domSanitizer: DomSanitizer) {

        // kuirl icon with text
        this._matIconRegistry.addSvgIcon(
            'kuirl_banner',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/kuirl-banner.svg')
        );
        // kuirl icon (for smaller screens
        this._matIconRegistry.addSvgIcon(
            'kuirl_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/kuirl-icon.svg')
        );
    }

    ngOnInit() {
    }

}
