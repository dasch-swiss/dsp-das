import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatIconRegistry, MatSelectChange, MatOption } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { ClassDefinition, KnoraApiConnection, ListNodeInfo, ReadOntology, ResourcePropertyDefinition } from '@knora/api';
import { KnoraApiConnectionToken, AutocompleteItem } from '@knora/core';
import { CacheService } from 'src/app/main/cache/cache.service';
import { DefaultPropertyType, PropertyTypes, DefaultValueType } from '../../default-data/poperty-types';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

// https://stackoverflow.com/questions/45661010/dynamic-nested-reactive-form-expressionchangedafterithasbeencheckederror
// const resolvedPromise = Promise.resolve(null);

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

    // list of existing properties
    properties: AutocompleteItem[] = [];

    filteredProperties: Observable<AutocompleteItem[]>;


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
                // set list of resource types from response; needed for linkValue
                const classKeys: string[] = Object.keys(response.classes);
                for (const c of classKeys) {
                    this.resourceTypes.push(this.ontology.classes[c]);
                }

                // set list of properties from response; needed for autocomplete to avoid same property name twice
                const propKeys: string[] = Object.keys(response.properties);
                let i: number = 0;
                for (const p of propKeys) {
                    this.properties[i] = {
                        iri: this.ontology.properties[p].id,
                        name: this.ontology.properties[p].id.split('#')[1],
                        label: this.ontology.properties[p].label
                    };
                    i++;
                    // this.properties.push(this.ontology.properties[p]);
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
        console.log(this.propertyForm);

        this.filteredProperties = this.propertyForm.controls['name'].valueChanges
            .pipe(
                startWith(''),
                map(prop => prop.length >= 2 ? this.filter(this.properties, prop) : [])
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

    /**
     * filter a list while typing in auto complete input field
     * @param list List of options
     * @param name Value to filter by
     * @returns Filtered list of options
     */
    filter(list: AutocompleteItem[], name: string) {
        return list.filter(prop =>
            prop.name.toLowerCase().includes(name.toLowerCase())
        );
    }

    updateAttributeField(event: MatSelectChange) {

        console.log('updateAttrField');

        // reset value of guiAttr
        this.propertyForm.controls['guiAttr'].setValue(undefined);
        // depending on the selected property type,
        // we have to define gui element attributes
        // e.g. iri of list or connected resource type
        switch (event.value.subPropOf) {
            case 'knora-api:ListValue':
            case 'knora-api:LinkValue':
                this.showGuiAttr = true;
                this.propertyForm.controls['guiAttr'].setValidators([
                    Validators.required
                ]);
                this.propertyForm.controls['guiAttr'].updateValueAndValidity();
                break;

            default:
                this.propertyForm.controls['guiAttr'].clearValidators();
                this.propertyForm.controls['guiAttr'].updateValueAndValidity();
                this.showGuiAttr = false;
        }

    }

    /**
     * @param  {MatOption} option
     */
    updateFieldsDependingOnName(option: MatOption) {
        this.propertyForm.controls['name'].setValue(option.value.name);
        this.propertyForm.controls['label'].setValue(option.value.label);
        this.propertyForm.controls['label'].disable();

        console.log(typeof this.ontology.properties[option.value.iri]);

        if (this.ontology.properties[option.value.iri] instanceof ResourcePropertyDefinition) {
            const tempProp: any = this.ontology.properties[option.value.iri];

            let obj: DefaultValueType;
            // find gui ele from list of default property-types to set type value
            for (let group of this.propertyTypes) {
                obj = group.elements.find(i => i.gui_ele === 'salsah-gui:' + tempProp.guiElement.split('#')[1]);

                if (obj) {
                    this.propertyForm.controls['type'].setValue(obj);
                    break;
                }
            }

            switch (tempProp.guiElement) {
                case 'http://api.knora.org/ontology/salsah-gui/v2#List':
                    console.log('set attr to', tempProp.guiAttributes[0].split('hlist=<')[1].slice(0, -1));
                    this.showGuiAttr = true;
                    this.propertyForm.controls['guiAttr'].setValue(tempProp.guiAttributes[0].split('hlist=<')[1].slice(0, -1));
                    this.propertyForm.controls['guiAttr'].disable();
                    break;
            }
            // console.log('prop', tempProp.gui);

            //            this.propertyForm.controls['type'].setValue(tempProp.guiElement);
            // this.updateAttributeField()
        }
        this.propertyForm.controls['type'].disable();

    }

}
