import { Component, Input, OnInit } from '@angular/core';
import { ReadDocumentFileValue } from '@dasch-swiss/dsp-js';
import { Region } from '@dasch-swiss/dsp-ui';
import { FileRepresentation } from '../file-representation';

/**
 * represents a still image file value including its regions.
 */
export class DocumentRepresentation {

    /**
     *
     * @param documentFileValue a [[ReadDocumentFileValue]] representing a document such as pdf.
     */
    constructor(readonly documentFileValue: ReadDocumentFileValue, readonly regions: Region[]) {

    }

}

@Component({
    selector: 'app-document',
    templateUrl: './document.component.html',
    styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

    @Input() document: FileRepresentation;

    constructor() { }

    ngOnInit(): void {
    }

    download() {
        // console.log(this.document.fileValue.fileUrl);
    }

}
