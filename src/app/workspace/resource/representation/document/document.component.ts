import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ReadDocumentFileValue } from '@dasch-swiss/dsp-js';
import { Region } from '@dasch-swiss/dsp-ui';
import { dir } from 'console';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
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

    @ViewChild(PdfViewerComponent) private _pdfComponent: PdfViewerComponent;

    zoomFactor = 1.0;

    pdfQuery = '';

    constructor(
        private readonly _http: HttpClient
    ) { }

    ngOnInit(): void {
    }

    download() {
        // console.log(this.document.fileValue.fileUrl);
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/pdf');
        return this._http.get(this.document.fileValue.fileUrl, { headers: headers, responseType: 'blob' });
    }


    searchQueryChanged(newQuery: string) {
        if (newQuery !== this.pdfQuery) {
            this.pdfQuery = newQuery;
            this._pdfComponent.pdfFindController.executeCommand('find', {
                query: this.pdfQuery,
                highlightAll: true,
            });
        } else {
            this._pdfComponent.pdfFindController.executeCommand('findagain', {
                query: this.pdfQuery,
                highlightAll: true,
            });
        }
    }

}
