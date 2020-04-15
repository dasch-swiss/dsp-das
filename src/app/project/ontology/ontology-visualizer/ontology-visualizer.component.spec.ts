import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OnInit, Component, ViewChild, DebugElement } from '@angular/core';
import { KuiActionModule } from '@knora/action';
import {ClassDefinition, KnoraApiConnection, ReadOntology, ResourceClassDefinition} from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule } from '@knora/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { OntologyVisualizerComponent } from './ontology-visualizer.component';

fdescribe('OntologyVisualizerComponent', () => {
    let testHostComponent: OntologyVisualizerComponent;
    let testHostFixture: ComponentFixture<OntologyVisualizerComponent>;
    // test ontology
    const testOntology = new ReadOntology();
    testOntology.id = 'http://www.knora.org/ontology/0000/testontology';
    // a test resource class
    const testResourceClass1 = new ResourceClassDefinition();
    testResourceClass1.id = 'http://www.knora.org/ontology/0000/testontology/v2#testResource1';
    testResourceClass1.canBeInstantiated  = true;
    testResourceClass1.comment = 'first test resource class';
    testResourceClass1.label = 'Test Resource 1';
    testResourceClass1.propertiesList = [];
    testResourceClass1.subClassOf = ['http://api.knora.org/ontology/knora-api/v2#Resource', 'http://purl.org/ontology/bibo/testResource'];
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                OntologyVisualizerComponent,
                ErrorComponent
            ],
            imports: [
                HttpClientTestingModule,
                KuiActionModule,
                KuiCoreModule,
                RouterTestingModule
            ],
            providers: [
                AppInitService,
                {
                    provide: KnoraApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                }
            ]
        })
            .compileComponents();
    }));
    beforeEach(() => {
        testHostFixture = TestBed.createComponent(OntologyVisualizerComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostComponent.ontoClasses = [testResourceClass1];
        testHostComponent.ontology = testOntology;
        testHostFixture.detectChanges();
    });
    it(`should check the component input (ontology and ontoClasses)`, async( () => {
        expect(testHostComponent.ontoClasses.length).toEqual(1);
        expect(testHostComponent.ontoClasses[0].propertiesList.length).toEqual(0);
        expect(testHostComponent.ontology.id).toMatch('http://www.knora.org/ontology/0000/testontology');
    }));
    it(`should get ontology prefix, resource label, and combination of both from class IRI`, async( () => {
       const resLabelInfo = testHostComponent.createLabelFromIRI('http://www.knora.org/ontology/0000/testontology/v2#testResource1');
       expect(resLabelInfo.ontoName).toEqual('testontology');
       expect(resLabelInfo.type).toEqual('testResource1');
       expect(resLabelInfo.newLabel).toEqual(resLabelInfo.ontoName + ':' + resLabelInfo.type);
    }));
    it(`should convert resource classes defined in ontology to nodes`, async( () => {
        expect(testHostComponent.nodes.length).toEqual(3);
        const nodeForTestResource1 = testHostComponent.nodes[0];
        expect(nodeForTestResource1['id']).toEqual('http://www.knora.org/ontology/0000/testontology/v2#testResource1');
        expect(nodeForTestResource1['label']).toEqual('testontology:testResource1');
        expect(nodeForTestResource1['class']).toEqual('native');
        expect(nodeForTestResource1['group']).toEqual('resource');
    }));
    it(`should convert super classes defined for resources to nodes as external resource`, async( () => {
        const nodeForKnoraResource = {
            'id': 'http://api.knora.org/ontology/knora-api/v2#Resource',
            'label': 'knora-api:Resource',
            'group': 'resource',
            'class': 'external'
        };
        expect(testHostComponent.nodes).toContain(nodeForKnoraResource);
        const nodeForbiboResource = {
            'id': 'http://purl.org/ontology/bibo/testResource',
            'label': 'http://purl.org/ontology/bibo/testResource',
            'group': 'resource',
            'class': 'external'
        };
        expect(testHostComponent.nodes).toContain(nodeForbiboResource);
    }));
    it(`should check if a resource class is in nodes list with its IRI`, async( () => {
        expect(testHostComponent.isInNodes('http://www.knora.org/ontology/0000/testontology/v2#testResource1')).toBeTruthy();

    }));
    it(`should create links defining subclass relations`, async( () => {
        expect(testHostComponent.links.length).toEqual(2);
        const subClassofKnoraAPiResource = {
            'source': 'http://www.knora.org/ontology/0000/testontology/v2#testResource1',
            'target': 'http://api.knora.org/ontology/knora-api/v2#Resource',
            'label': 'subClassOf'
        };
        const subClassofBiboResource = {
            'source': 'http://www.knora.org/ontology/0000/testontology/v2#testResource1',
            'target': 'http://purl.org/ontology/bibo/testResource',
            'label': 'subClassOf'
        };

        expect(testHostComponent.links).toContain(subClassofBiboResource);
        expect(testHostComponent.links).toContain(subClassofKnoraAPiResource);
    }));

});
