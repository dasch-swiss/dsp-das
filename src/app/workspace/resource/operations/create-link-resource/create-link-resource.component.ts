import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReadResource } from '@dasch-swiss/dsp-js';

@Component({
    selector: 'app-create-link-resource',
    templateUrl: './create-link-resource.component.html',
    styleUrls: ['./create-link-resource.component.scss']
})
export class CreateLinkResourceComponent implements OnInit {

    @Input() parentResource: ReadResource;
    @Input() propIri: string;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    constructor() { }

    ngOnInit(): void {
    }

    // the goal of this is to send a CreateResource request in the end

}
