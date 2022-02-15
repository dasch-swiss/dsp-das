import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-link-resource-results',
    templateUrl: './link-resource-results.component.html',
    styleUrls: ['./link-resource-results.component.scss']
})
export class LinkResourceResultsComponent implements OnInit {
    @Input() parentResource: ReadResource;
    @Input() propDef: string;
    @Input() resourceClassDef: string;
    @Input() resources: ReadResource[];

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    ngOnInit(): void {
        console.log('parentResource: ', this.parentResource);
        console.log('propDef: ', this.propDef);
        console.log('resourceClassDef: ', this.resourceClassDef);
        console.log('resources: ', this.resources);
    }

}
