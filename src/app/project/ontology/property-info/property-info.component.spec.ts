import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IHasProperty, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { PropertyInfoComponent } from './property-info.component';


/**
 * Test host component to simulate parent component.
 */
@Component({
    selector: 'app-host-component',
    template: '<app-property-info [propCard]="propertyCardinality" [propDef]="propertyDefinition"></app-property-info>'
})
class TestHostComponent {

    @ViewChild('propertyInfo') propertyInfo: PropertyInfoComponent;

    propertyCardinality: IHasProperty = {
        propertyIndex: "http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notd6qi3j",
        cardinality: 0,
        guiOrder: 1,
        isInherited: false
    };
    propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
        id: "http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notd6qi3j",
        comment: "Titel",
        comments: [
            {
                language: "de",
                value: "Titel"
            }
        ],
        guiElement: "http://api.knora.org/ontology/salsah-gui/v2#SimpleText",
        guiAttributes: [],
        isEditable: true,
        isLinkProperty: false,
        isLinkValueProperty: false,
        label: "Titel",
        labels: [
            {
                language: "de",
                value: "Titel"
            }
        ],
        lastModificationDate: undefined,
        objectType: "http://api.knora.org/ontology/knora-api/v2#TextValue",
        subPropertyOf: ["http://api.knora.org/ontology/knora-api/v2#hasValue"],
        subjectType: undefined
    };

}

describe('PropertyInfoComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestHostComponent,
                PropertyInfoComponent
            ],
            imports: [
                MatIconModule,
                MatListModule,
                MatTooltipModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
    });
});
