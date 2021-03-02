import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ClassDefinition, ReadOntology } from '@dasch-swiss/dsp-js';
import { DefaultInfo } from '../default-data/default-resource-classes';

@Component({
    selector: 'app-resource-class-info',
    templateUrl: './resource-class-info.component.html',
    styleUrls: ['./resource-class-info.component.scss']
})
export class ResourceClassInfoComponent implements OnInit {

    @Input() resourceClass: ClassDefinition;

    @Input() ontology: ReadOntology;

    @Output() editResourceClass: EventEmitter<DefaultInfo> = new EventEmitter<DefaultInfo>();
    @Output() updateCardinality: EventEmitter<ClassDefinition> = new EventEmitter<ClassDefinition>();
    @Output() deleteResourceClass: EventEmitter<DefaultInfo> = new EventEmitter<DefaultInfo>();


    // open / close res class card
    expanded = false;

    constructor() { }

    ngOnInit(): void {
        console.log(this.resourceClass);
    }

}
