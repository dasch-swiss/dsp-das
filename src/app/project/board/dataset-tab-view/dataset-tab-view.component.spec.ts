import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DatasetTabViewComponent } from './dataset-tab-view.component';
import { Component, ViewChild } from '@angular/core';


/**
* Test host component to simulate parent component.
*/
@Component({
    selector: 'app-board-host-component',
    template: '<app-dataset-tab-view [metadata]="datasetMetadata"></app-dataset-tab-view>'
})
class TestHostBoardComponent {

    @ViewChild('datasetTabView') datasetTabView: DatasetTabViewComponent;

    // metadata object
    datasetMetadata = {'projectsMetadata':[{'type':'http://ns.dasch.swiss/repository#Dataset','id':'http://ns.dasch.swiss/repository#test-dataset','abstract':['Dies ist ein Testprojekt.'],'alternativeTitle':'test','conditionsOfAccess':'Open Access','dateCreated':'2001-09-26','dateModified':'2020-04-26','datePublished':'2002-09-24','distribution':{'type':'https://schema.org/DataDownload','url':'https://test.dasch.swiss'},'documentation':['Work in progress'],'howToCite':'Testprojekt (test), 2002, https://test.dasch.swiss','language':['EN','DE','FR'],'license':[{'type':'https://schema.org/URL','url':'https://creativecommons.org/licenses/by/3.0'}],'qualifiedAttribution':[{'type':'http://www.w3.org/ns/prov#Attribution','role':['contributor'],'agent':[{'id':'http://ns.dasch.swiss/repository#test-berry'}]},{'type':'http://www.w3.org/ns/prov#Attribution','role':['contributor'],'agent':[{'id':'http://ns.dasch.swiss/repository#test-hart'}]},{'type':'http://www.w3.org/ns/prov#Attribution','role':['editor'],'agent':[{'id':'http://ns.dasch.swiss/repository#test-abraham'}]},{'type':'http://www.w3.org/ns/prov#Attribution','role':['editor'],'agent':[{'id':'http://ns.dasch.swiss/repository#test-jones'}]},{'type':'http://www.w3.org/ns/prov#Attribution','role':['editor'],'agent':[{'id':'http://ns.dasch.swiss/repository#test-coleman'}]}],'status':'Ongoing','title':'Testprojekt','typeOfData':['Image','Text'],'project':{'id':'http://ns.dasch.swiss/repository#test-project'},'sameAs':[{'type':'https://schema.org/URL','url':'https://test.dasch.swiss/'}]},{'type':'http://ns.dasch.swiss/repository#Person','id':'http://ns.dasch.swiss/repository#test-hart','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':['leonhard.hart@test.ch'],'familyName':'Hart','givenName':'Leonhard;Aaron','jobTitle':['Prof.'],'memberOf':[{'id':'http://ns.dasch.swiss/repository#test-dasch'}]},{'type':'http://ns.dasch.swiss/repository#Person','id':'http://ns.dasch.swiss/repository#test-abraham','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':['stewart.abraham@test.ch'],'familyName':'Abraham','givenName':'Steward','jobTitle':['Dr.'],'memberOf':[{'id':'http://ns.dasch.swiss/repository#test-dasch'}],'sameAs':[{'type':'https://schema.org/URL','url':'https://orcid.org/0000-0002-1825-0097'}]},{'type':'http://ns.dasch.swiss/repository#Person','id':'http://ns.dasch.swiss/repository#test-berry','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':['lauren.berry@unibas.ch'],'familyName':'Berry;Mackenzie','givenName':'Lauren','jobTitle':['Dr.'],'memberOf':[{'id':'http://ns.dasch.swiss/repository#test-dasch'}]},{'type':'http://ns.dasch.swiss/repository#Project','id':'http://ns.dasch.swiss/repository#test-project','alternateName':['test'],'contactPoint':[{'id':'http://ns.dasch.swiss/repository#test-abraham'}],'dataManagementPlan':[{'id':'http://ns.dasch.swiss/repository#test-plan'}],'description':'Dies ist ein Testprojekt...alle Properties wurden verwendet, um diese zu testen','discipline':[{'name':'SKOS UNESCO Nomenclature','type':'https://schema.org/URL','url':'http://skos.um.es/unesco6/11'}],'endDate':'2001-01-26','funder':[{'id':'http://ns.dasch.swiss/repository#test-funder'}],'grant':[{'id':'http://ns.dasch.swiss/repository#test-grant'}],'keywords':['science','mathematics','history of science','history of mathematics'],'name':'Testprojektname (test)','publication':['testpublication'],'shortcode':'0000','spatialCoverage':[{'place':{'name':'Geonames','url':'https://www.geonames.org/2017370/russian-federation.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/2658434/switzerland.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/3175395/italian-republic.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/2921044/federal-republic-of-germany.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/3017382/republic-of-france.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/6269131/england.html'}},{'place':{'name':'Geonames','url':'https://www.geonames.org/6255148/europe.html'}}],'startDate':'2000-07-26','temporalCoverage':[{'name':'Chronontology Dainst','type':'https://schema.org/URL','url':'http://chronontology.dainst.org/period/Ef9SyESSafJ1'}],'url':[{'type':'https://schema.org/URL','url':'https://test.dasch.swiss/'}]},{'type':'http://ns.dasch.swiss/repository#DataManagementPlan','id':'http://ns.dasch.swiss/repository#test-plan','url':[{'type':'https://schema.org/URL','url':'https://snf.ch'}],'isAvailable':false},{'type':'http://ns.dasch.swiss/repository#Person','id':'http://ns.dasch.swiss/repository#test-coleman','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':['james.coleman@dasch.swiss'],'familyName':'Coleman','givenName':'James','jobTitle':['Dr. des.'],'memberOf':[{'id':'http://ns.dasch.swiss/repository#test-dasch'}]},{'type':'http://ns.dasch.swiss/repository#Organization','id':'http://ns.dasch.swiss/repository#test-dasch','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':'info@dasch.swiss','name':['TEST'],'url':[{'type':'https://schema.org/URL','url':'https://test.swiss'}]},{'type':'http://ns.dasch.swiss/repository#Grant','id':'http://ns.dasch.swiss/repository#test-grant','funder':[{'id':'http://ns.dasch.swiss/repository#test-funder'}],'name':'Prof. test test, Prof. test Harbtestrecht','number':'0123456789','url':[{'type':'https://schema.org/URL','url':'http://p3.snf.ch/testproject'}]},{'type':'http://ns.dasch.swiss/repository#Organization','id':'http://ns.dasch.swiss/repository#test-funder','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Toronto','postalCode':'40000','streetAddress':'University of Toronto Street'},'email':'info@universityoftoronto.ca','name':['University of Toronto'],'url':[{'type':'https://schema.org/URL','url':'http://www.utoronto.ca/'}]},{'type':'http://ns.dasch.swiss/repository#Person','id':'http://ns.dasch.swiss/repository#test-jones','address':{'type':'https://schema.org/PostalAddress','addressLocality':'Basel','postalCode':'4000','streetAddress':'Teststrasse'},'email':['benjamin.jones@test.ch'],'familyName':'Jones','givenName':'Benjamin','jobTitle':['Dr. des.'],'memberOf':[{'id':'http://ns.dasch.swiss/repository#test-dasch'}]}]};
}

describe('DatasetTabViewComponent', () => {
    let testHostComponent: TestHostBoardComponent;
    let testHostFixture: ComponentFixture<TestHostBoardComponent>;
    
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestHostBoardComponent,
                DatasetTabViewComponent
            ]
        })
        .compileComponents();
    }));
    
    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostBoardComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });
    
    it('should create', () => {
        expect(testHostComponent).toBeTruthy();
    });
});
