import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IHasProperty, KnoraApiConnection, ListNodeInfo, ResourcePropertyDefinitionWithAllLanguages } from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { of } from 'rxjs';
import { CacheService } from 'src/app/main/cache/cache.service';
import { TestConfig } from 'test.config';
import { ResourceClassPropertyFormComponent } from './resource-class-property-form.component';


/**
 * test host component to simulate parent component
 * Property is of type simple text
 */
@Component({
    template: '<app-resource-class-property-form #propertyForm [propertyForm]="prop" [index]="i" [ontology]="ontology" [resClassIri]="iri"></app-resource-class-property-form>'
})
class SimpleTextHostComponent {

    @ViewChild('propertyForm') resClassPropertyFormComponent: ResourceClassPropertyFormComponent;

    propertyCardinality: IHasProperty = {
        propertyIndex: 'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
        cardinality: 0,
        guiOrder: 1,
        isInherited: false
    };
    propertyDefinition: ResourcePropertyDefinitionWithAllLanguages = {
        'id': 'http://0.0.0.0:3333/ontology/1111/Notizblogg/v2#notgkygty',
        'subPropertyOf': ['http://api.knora.org/ontology/knora-api/v2#hasValue'],
        'comment': 'Beschreibt einen Namen',
        'label': 'Name',
        'guiElement': 'http://api.knora.org/ontology/salsah-gui/v2#SimpleText',
        'objectType': 'http://api.knora.org/ontology/knora-api/v2#TextValue',
        'isLinkProperty': false,
        'isLinkValueProperty': false,
        'isEditable': true,
        'guiAttributes': [],
        'comments': [{
            'language': 'de',
            'value': 'Beschreibt einen Namen'
        }],
        'labels': [{
            'language': 'de',
            'value': 'Name'
        }]
    };

}


fdescribe('ResourceClassPropertyFormComponent', () => {
    let component: ResourceClassPropertyFormComponent;
    let fixture: ComponentFixture<ResourceClassPropertyFormComponent>;

    const formBuilder: FormBuilder = new FormBuilder();

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ResourceClassPropertyFormComponent],
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatAutocompleteModule,
                MatDialogModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                MatSnackBarModule,
                ReactiveFormsModule
            ],
            providers: [
                // reference the new instance of formBuilder from above
                { provide: FormBuilder, useValue: formBuilder },
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy
                },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {

        // mock cache service for currentOntologyLists
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(
            () => {
                const response: ListNodeInfo[] = [{
                    'comments': [],
                    'id': 'http://rdfh.ch/lists/0001/otherTreeList',
                    'isRootNode': true,
                    'labels': [{
                        'language': 'en',
                        'value': 'Tree list root'
                    }],
                    'projectIri': 'http://rdfh.ch/projects/0001'
                }, {
                    'comments': [{
                        'language': 'en',
                        'value': 'a list that is not in used in ontology or data'
                    }],
                    'id': 'http://rdfh.ch/lists/0001/notUsedList',
                    'isRootNode': true,
                    'labels': [{
                        'language': 'de',
                        'value': 'unbenutzte Liste'
                    }, {
                        'language': 'en',
                        'value': 'a list that is not used'
                    }],
                    'name': 'notUsedList',
                    'projectIri': 'http://rdfh.ch/projects/0001'
                }, {
                    'comments': [{
                        'language': 'en',
                        'value': 'Anything Tree List'
                    }],
                    'id': 'http://rdfh.ch/lists/0001/treeList',
                    'isRootNode': true,
                    'labels': [{
                        'language': 'de',
                        'value': 'Listenwurzel'
                    }, {
                        'language': 'en',
                        'value': 'Tree list root'
                    }],
                    'name': 'treelistroot',
                    'projectIri': 'http://rdfh.ch/projects/0001'
                }];
                return of(response);
            }
        );

        fixture = TestBed.createComponent(ResourceClassPropertyFormComponent);
        component = fixture.componentInstance;

        // pass in the form dynamically
        component.propertyForm = formBuilder.group({
            type: null,
            label: null,
            multiple: null,
            required: null,
            permission: null
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
