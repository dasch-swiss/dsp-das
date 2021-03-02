import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { ApiResponseError, ClassDefinition, ReadOntology } from '@dasch-swiss/dsp-js';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DefaultInfo } from '../default-data/default-resource-classes';

@Component({
    selector: 'app-resource-class-info',
    templateUrl: './resource-class-info.component.html',
    styleUrls: ['./resource-class-info.component.scss']
})
export class ResourceClassInfoComponent implements OnInit {

    @Input() resourceClass: ClassDefinition;

    @Output() editResourceClass: EventEmitter<DefaultInfo> = new EventEmitter<DefaultInfo>();
    @Output() updateCardinality: EventEmitter<ClassDefinition> = new EventEmitter<ClassDefinition>();
    @Output() deleteResourceClass: EventEmitter<DefaultInfo> = new EventEmitter<DefaultInfo>();

    ontology: ReadOntology;

    // open / close res class card
    expanded = false;

    constructor(
        private _cache: CacheService
    ) { }

    ngOnInit(): void {
        this._cache.get('currentOntology').subscribe(
            (response: ReadOntology) => {
                this.ontology = response;
            },
            (error: ApiResponseError) => {
                console.error(error);
            }
        )
        // console.log(JSON.stringify(this.resourceClass));
    }

}
