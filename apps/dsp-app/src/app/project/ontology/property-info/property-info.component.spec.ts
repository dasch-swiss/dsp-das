import { OverlayContainer } from '@angular/cdk/overlay';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MatLegacyDialogModule as MatDialogModule,
    MatLegacyDialogRef as MatDialogRef,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { MatLegacyDialogHarness as MatDialogHarness } from '@angular/material/legacy-dialog/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    CanDoResponse,
    Constants,
    IHasProperty,
    ListNodeInfo,
    MockOntology,
    OntologiesEndpointV2,
    ReadOntology,
    ResourcePropertyDefinitionWithAllLanguages,
} from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { AppInitService } from '@dsp-app/src/app/app-init.service';
import { CacheService } from '@dsp-app/src/app/main/cache/cache.service';
import {
    DspApiConfigToken,
    DspApiConnectionToken,
} from '@dsp-app/src/app/main/declarations/dsp-api-tokens';
import { DialogHeaderComponent } from '@dsp-app/src/app/main/dialog/dialog-header/dialog-header.component';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { SplitPipe } from '@dsp-app/src/app/main/pipes/split.pipe';
import { TestConfig } from '@dsp-app/src/test.config';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { PropertyInfoComponent } from './property-info.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import {
    StringifyStringLiteralPipe
} from '@dsp-app/src/app/main/pipes/string-transformation/stringify-string-literal.pipe';
import { ClassDefinition } from '@dasch-swiss/dsp-js/src/models/v2/ontologies/class-definition';

/**
 * test host component to simulate parent component
 * Property is of type simple text
 */
@Component({
    template:
        '<app-property-info #propertyInfo [propDef]="propertyDefinition"></app-property-info>',
})
class SimpleTextHostComponent {
    @ViewChild('propertyInfo') propertyInfoComponent: PropertyInfoComponent;

    propertyCardinality: IHasProperty = {
        propertyIndex:
            'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
        cardinality: 0,
        guiOrder: 1,
        isInherited: false,
    };
    propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
        id: 'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
        subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
        comment: 'Beschreibt einen Namen',
        label: 'Name',
        guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
        objectType: 'http://api.knora.org/ontology/knora-api/v2#TextValue',
        isLinkProperty: false,
        isLinkValueProperty: false,
        isEditable: true,
        guiAttributes: [],
        comments: [
            {
                language: 'de',
                value: 'Beschreibt einen Namen',
            },
        ],
        labels: [
            {
                language: 'de',
                value: 'Name',
            },
        ],
    };
}

/**
 * test host component to simulate parent component
 * Property is of type resource link
 */
@Component({
    template:
        '<app-property-info #propertyInfo [propDef]="propertyDefinition"></app-property-info>',
})
class LinkHostComponent {
    @ViewChild('propertyInfo') propertyInfoComponent: PropertyInfoComponent;

    propertyCardinality: IHasProperty = {
        propertyIndex:
            'http://0.0.0.0:3333/ontology/0001/anything/v2#hasOtherThing',
        cardinality: 2,
        guiOrder: 1,
        isInherited: false,
    };
    propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
        id: 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasOtherThing',
        subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasLinkTo'],
        label: 'Ein anderes Ding',
        guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#Searchbox',
        subjectType: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing',
        objectType: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing',
        isLinkProperty: true,
        isLinkValueProperty: false,
        isEditable: true,
        guiAttributes: [],
        comments: [],
        labels: [
            {
                language: 'de',
                value: 'Ein anderes Ding',
            },
            {
                language: 'en',
                value: 'Another thing',
            },
            {
                language: 'fr',
                value: 'Une autre chose',
            },
            {
                language: 'it',
                value: 'Un altra cosa',
            },
        ],
    };
}

/**
 * test host component to simulate parent component
 * Property is of type list dropdown
 */
@Component({
    template:
        '<app-property-info #propertyInfo [propDef]="propertyDefinition"></app-property-info>',
})
class ListHostComponent {
    @ViewChild('propertyInfo') propertyInfoComponent: PropertyInfoComponent;

    propertyCardinality: IHasProperty = {
        propertyIndex:
            'http://0.0.0.0:3333/ontology/0001/anything/v2#hasListItem',
        cardinality: 2,
        guiOrder: 0,
        isInherited: true,
    };
    propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
        id: 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasListItem',
        subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
        label: 'Listenelement',
        guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#List',
        subjectType: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing',
        objectType: 'http://api.knora.org/ontology/knora-api/v2#ListValue',
        isLinkProperty: false,
        isLinkValueProperty: false,
        isEditable: true,
        guiAttributes: ['hlist=<http://rdfh.ch/lists/0001/treeList>'],
        comments: [],
        labels: [
            {
                language: 'de',
                value: 'Listenelement',
            },
            {
                language: 'en',
                value: 'List element',
            },
            {
                language: 'fr',
                value: 'Elément de liste',
            },
            {
                language: 'it',
                value: 'Elemento di lista',
            },
        ],
    };
}

const propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
    id: 'http://0.0.0.0:3333/ontology/0001/anything/v2#hasListItem',
    subPropertyOf: ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
    label: 'Listenelement',
    guiElement: 'http://api.knora.org/ontology/salsah-gui/v2#List',
    subjectType: 'http://0.0.0.0:3333/ontology/0001/anything/v2#Thing',
    objectType: 'http://api.knora.org/ontology/knora-api/v2#ListValue',
    isLinkProperty: false,
    isLinkValueProperty: false,
    isEditable: true,
    guiAttributes: ['hlist=<http://rdfh.ch/lists/0001/treeList>'],
    comments: [],
    labels: [
        {
            language: 'de',
            value: 'Listenelement',
        },
        {
            language: 'en',
            value: 'List element',
        },
        {
            language: 'fr',
            value: 'Elément de liste',
        },
        {
            language: 'it',
            value: 'Elemento di lista',
        },
    ],
};

const mockOntologyResponse = [
    {
        comments: [],
        id: 'http://rdfh.ch/lists/0001/otherTreeList',
        isRootNode: true,
        labels: [
            {
                language: 'en',
                value: 'Tree list root',
            },
        ],
        projectIri: 'http://rdfh.ch/projects/0001',
    },
    {
        comments: [
            {
                language: 'en',
                value: 'a list that is not in used in ontology or data',
            },
        ],
        id: 'http://rdfh.ch/lists/0001/notUsedList',
        isRootNode: true,
        labels: [
            {
                language: 'de',
                value: 'unbenutzte Liste',
            },
            {
                language: 'en',
                value: 'a list that is not used',
            },
        ],
        name: 'notUsedList',
        projectIri: 'http://rdfh.ch/projects/0001',
    },
    {
        comments: [
            {
                language: 'en',
                value: 'Anything Tree List',
            },
        ],
        id: 'http://rdfh.ch/lists/0001/treeList',
        isRootNode: true,
        labels: [
            {
                language: 'de',
                value: 'Listenwurzel',
            },
            {
                language: 'en',
                value: 'Tree list root',
            },
        ],
        name: 'treelistroot',
        projectIri: 'http://rdfh.ch/projects/0001',
    },
];

    describe('Property info component', () => {
        let component: PropertyInfoComponent;
        let fixture: ComponentFixture<PropertyInfoComponent>;

        beforeEach(async () => {
            const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

            const ontologyEndpointSpyObj = {
                v2: {
                    onto: jasmine.createSpyObj('onto', [
                        'canDeleteResourceProperty',
                        'getAllClassDefinitions'
                    ]),
                },
            };

            await TestBed.configureTestingModule({
                declarations: [
                    DialogComponent,
                    DialogHeaderComponent,
                    LinkHostComponent,
                    ListHostComponent,
                    SimpleTextHostComponent,
                    PropertyFormComponent,
                    PropertyInfoComponent,
                    SplitPipe,
                    StringifyStringLiteralPipe
                ],
                imports: [
                    BrowserAnimationsModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatListModule,
                    MatMenuModule,
                    MatSlideToggleModule,
                    MatSnackBarModule,
                    MatTooltipModule,
                ],
                providers: [
                    AppInitService,
                    {
                        provide: DspApiConfigToken,
                        useValue: TestConfig.ApiConfig,
                    },
                    {
                        provide: DspApiConnectionToken,
                        useValue: ontologyEndpointSpyObj,
                    },
                    {
                        provide: CacheService,
                        useValue: cacheServiceSpy,
                    },
                    {
                        provide: MAT_DIALOG_DATA,
                        useValue: {},
                    },
                    {
                        provide: MatDialogRef,
                        useValue: {},
                    },
                ],
            }).compileComponents();
        });

        beforeEach(() => {
            // mock cache service get requests
            const cacheSpy = TestBed.inject(CacheService);

            (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake((key: string) => {
                if (key === 'currentOntologyLists') {
                    const response: ListNodeInfo[] = mockOntologyResponse;
                    return of(response);
                } else if (key === 'currentProjectOntologies') {
                    const response: ReadOntology[] = [];
                    return of(response);
                } else if (key === 'currentOntology') {
                    const response: ReadOntology = undefined;
                    return of(response);
                }else {
                    // Handle any other keys as needed
                    return of(null);
                }
            });

            const dspConnSpy = TestBed.inject(DspApiConnectionToken);
            (
                dspConnSpy.v2.onto as jasmine.SpyObj<OntologiesEndpointV2>
            ).canDeleteResourceProperty.and.callFake(() => {
                const deleteResProp: CanDoResponse = {
                    canDo: false,
                };

                return of(deleteResProp);
            });

            fixture = TestBed.createComponent(PropertyInfoComponent);
            component = fixture.componentInstance;
            component.propDef = propertyDefinition; // setting ock input

            fixture.detectChanges();
        });


        it('get propDef input', () => {
            expect(component.propDef).toBeTruthy();
        });
    });
