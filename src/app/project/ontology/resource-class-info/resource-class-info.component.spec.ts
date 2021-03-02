import { Component, OnInit, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClassDefinition, Constants, MockOntology, OntologiesEndpointV2, ReadOntology } from '@dasch-swiss/dsp-js';
import { DspActionModule, DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { of } from 'rxjs';
import { ResourceClassInfoComponent } from './resource-class-info.component';


/**
 * Test host component to simulate parent component
 * Property is of type simple text
 */
@Component({
    template: `<app-resource-class-info #resClassInfo [resourceClass]="resClass" [ontology]="ontology"></app-resource-class-info>`
})
class HostComponent implements OnInit {

    @ViewChild('resClassInfo') resourceClassInfoComponent: ResourceClassInfoComponent;

    // get ontology from DSP-JS-Lib test data
    ontology: ReadOntology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');

    resClass: ClassDefinition;

    ngOnInit() {

        console.warn(this.ontology)
        // grab the onto class information to display
        const allOntoClasses = this.ontology.getAllClassDefinitions();

        // reset the ontology classes
        const ontoClasses: ClassDefinition[] = [];

        // display only the classes which are not a subClass of Standoff
        allOntoClasses.forEach(resClass => {
            if (resClass.subClassOf.length) {
                const splittedSubClass = resClass.subClassOf[0].split('#');
                if (!splittedSubClass[0].includes(Constants.StandoffOntology) && !splittedSubClass[1].includes('Standoff')) {
                    ontoClasses.push(resClass);
                }
            }
        });

        this.resClass = ontoClasses[0];
    }
    // propertyCardinality: IHasProperty = {
    //     propertyIndex: 'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
    //     cardinality: 0,
    //     guiOrder: 1,
    //     isInherited: false
    // };
    // propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
    //     'id': 'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
    //     'subPropertyOf': ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
    //     'comment': 'Beschreibt einen Namen',
    //     'label': 'Name',
    //     'guiElement': 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
    //     'objectType': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
    //     'isLinkProperty': false,
    //     'isLinkValueProperty': false,
    //     'isEditable': true,
    //     'guiAttributes': [],
    //     'comments': [{
    //         'language': 'de',
    //         'value': 'Beschreibt einen Namen'
    //     }],
    //     'labels': [{
    //         'language': 'de',
    //         'value': 'Name'
    //     }]
    // };

}


fdescribe('ResourceClassInfoComponent', () => {
    let component: ResourceClassInfoComponent;
    let fixture: ComponentFixture<ResourceClassInfoComponent>;

    beforeEach(async(() => {
        const dspConnSpy = {
            v2: {
                onto: jasmine.createSpyObj('onto', ['getOntology']),
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                ResourceClassInfoComponent
            ],
            imports: [
                DspActionModule,
                MatCardModule,
                MatIconModule,
                MatMenuModule,
                MatTooltipModule
            ],
            providers: [
                {
                    provide: DspApiConnectionToken,
                    useValue: dspConnSpy
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ResourceClassInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        const dspConnSpy = TestBed.inject(DspApiConnectionToken);

        (dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>).getOntology.and.callFake(
            () => {
                const ontology = MockOntology.mockReadOntology('http://0.0.0.0:3333/ontology/0001/anything/v2');
                return of(ontology);
            }
        );
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
