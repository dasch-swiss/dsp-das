import { Component, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
    Constants,
    KnoraApiConnection,
    ReadOntology,
    ReadResource,
    ResourceClassAndPropertyDefinitions,
    ResourceClassDefinition,
    ResourcePropertyDefinition,
    ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DspApiConnectionToken } from 'src/app/main/declarations/dsp-api-tokens';
import { SelectPropertiesComponent } from '../../resource-instance-form/select-properties/select-properties.component';

@Component({
    selector: 'app-create-link-resource',
    templateUrl: './create-link-resource.component.html',
    styleUrls: ['./create-link-resource.component.scss']
})
export class CreateLinkResourceComponent implements OnInit {

    @Input() parentResource: ReadResource;
    @Input() propIri: string;
    @Input() resourceClassIri: string;

    @Output() closeDialog: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('selectProps') selectPropertiesComponent: SelectPropertiesComponent;

    properties: ResourcePropertyDefinition[];
    property: ResourcePropertyDefinition;
    resourceClass: ResourceClassDefinition;
    ontologyInfo: ResourceClassAndPropertyDefinitions;

    constructor(
        @Inject(DspApiConnectionToken) private _dspApiConnection: KnoraApiConnection,
        private _cache: CacheService
    ) { }

    ngOnInit(): void {
        console.log('parentResource: ', this.parentResource);
        console.log('propIri: ', this.propIri);
        console.log('resourceClassIri: ', this.resourceClassIri);

        this._dspApiConnection.v2.ontologyCache.getResourceClassDefinition(this.resourceClassIri).subscribe(
            (onto: ResourceClassAndPropertyDefinitions) => {
                console.log('onto: ', onto);
                this.ontologyInfo = onto;
                this.resourceClass = onto.classes[this.resourceClassIri];
                // this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition);
                this.properties = onto.getPropertyDefinitionsByType(ResourcePropertyDefinition).filter(
                    prop =>
                        !prop.isLinkProperty &&
                        prop.isEditable &&
                        prop.id !== Constants.HasStillImageFileValue &&
                        prop.id !== Constants.HasDocumentFileValue &&
                        prop.id !== Constants.HasAudioFileValue &&
                        prop.id !== Constants.HasArchiveFileValue
                );

                console.log('properties: ', this.properties);
            }
        );
    }

    // the goal of this is to send a CreateResource request in the end

}
