import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatIconRegistry, MatSelectChange } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { DefaultPropertyType, PropertyTypes } from '../../default-data/poperty-types';
import { ListNodeInfo, ReadOntology, KnoraApiConnection, ApiResponseData, ListsResponse, ApiResponseError, ClassDefinition } from '@knora/api';
import { KnoraApiConnectionToken, OntologyService } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
const resolvedPromise = Promise.resolve(null);

@Component({
    selector: 'app-source-type-property',
    templateUrl: './source-type-property.component.html',
    styleUrls: ['./source-type-property.component.scss']
})
export class SourceTypePropertyComponent implements OnInit {

    @Input() propertyForm: FormGroup;

    @Input() index: number;

    @Output() deleteProperty: EventEmitter<number> = new EventEmitter();

    name = new FormControl();
    label = new FormControl();
    type = new FormControl();
    multiple = new FormControl();
    required = new FormControl();

    // selection of default property types
    propertyTypes: DefaultPropertyType[] = PropertyTypes.data;

    showGuiAttr: boolean = false;

    // list of project specific lists (TODO: probably we have to add default knora lists?!)
    lists: ListNodeInfo[];

    // current ontology
    ontology: ReadOntology;

    // resource types in this ontology
    resourceTypes: ClassDefinition[] = [];


    selectTypeLabel: string; // = this.propertyTypes[0].group + ': ' + this.propertyTypes[0].elements[0].label;
    selectedGroup: string;



    // index of the given property (unique)
    // index: number;

    constructor(
        @Inject(KnoraApiConnectionToken) private knoraApiConnection: KnoraApiConnection,
        private _cache: CacheService,
        private _domSanitizer: DomSanitizer,
        private _matIconRegistry: MatIconRegistry) {

        // special icons for property type
        this._matIconRegistry.addSvgIcon(
            'integer_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/integer-icon.svg')
        );
        this._matIconRegistry.addSvgIcon(
            'decimal_icon',
            this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/decimal-icon.svg')
        );
    }

    ngOnInit() {

        if (this.propertyForm) {
            // init list of property types with first element
            this.propertyForm.patchValue({ type: this.propertyTypes[0].elements[0] });
        }

        this._cache.get('currentOntology').subscribe(
            (response: ReadOntology) => {
                this.ontology = response;

                console.log(response);
                // set list of resource types from response
                const classKeys: string[] = Object.keys(response.classes);

                for (const c of classKeys) {
                    this.resourceTypes.push(this.ontology.classes[c]);
                }
            },
            (error: any) => {
                console.error(error);
            }
        );

        this._cache.get('currentOntologyLists').subscribe(
            (response: ListNodeInfo[]) => {
                this.lists = response;
            },
            (error: any) => {
                console.error(error);
            }
        );



        // this._cache.get('currentOntology').subscribe(
        //     (response: ReadOntology) => {
        //         this.ontology = response;
        //         console.log(response);
        //         // get all ontology source types:
        //         // can be used to select source type as gui attribute in link property,
        //         // but also to avoid same name which should be unique
        //         const classKeys: string[] = Object.keys(response.classes);
        //         for (const c of classKeys) {
        //             this.existingSourceTypeNames.push(
        //                 new RegExp('(?:^|W)' + c.split('#')[1] + '(?:$|W)')
        //             )
        //         }
        //         // get all ontology properties
        //         const propKeys: string[] = Object.keys(response.properties);
        //         for (const p of propKeys) {
        //             this.existingPropertyNames.push(
        //                 new RegExp('(?:^|W)' + p.split('#')[1] + '(?:$|W)')
        //             )
        //         }
        //     },
        //     (error: any) => {
        //         console.error(error);
        //     }
        // );

    }

    updateAttributeField(event: MatSelectChange) {

        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource type
        switch (event.value.subPropOf) {
            case 'knora-api:ListValue':
            case 'knora-api:LinkValue':
                this.showGuiAttr = true;
                break;

            default:
                this.showGuiAttr = false;
        }



    }

}
