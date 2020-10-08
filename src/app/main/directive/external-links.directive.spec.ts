import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ExternalLinksDirective } from './external-links.directive';

@Component({
    template: `<a href="http://dasch.swiss/">{{ label }}</a>`
})
class TestExternalLinkComponent {

    label = 'DaSCH website';

    constructor() { }
}

describe('ExternalLinksDirective', () => {

    let testHostComponent: TestExternalLinkComponent;
    let testHostFixture: ComponentFixture<TestExternalLinkComponent>;
    let linkEl: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ExternalLinksDirective,
                TestExternalLinkComponent
            ]
        });

        testHostFixture = TestBed.createComponent(TestExternalLinkComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();

        linkEl = testHostFixture.debugElement.query(By.css('a[href]'));

        expect(testHostComponent).toBeTruthy();

    });

    it('should create an instance', () => {
        expect(testHostComponent).toBeTruthy();
    });

    it('should get the correct attributes', () => {
        expect(testHostComponent).toBeTruthy();

        expect(linkEl.attributes.rel).toEqual('noopener');
        expect(linkEl.attributes.target).toEqual('_blank');
        expect(linkEl.attributes.href).toEqual('http://dasch.swiss/');
    });

    it('should react to clicking on an external link', () => {
        expect(testHostComponent).toBeTruthy();

        linkEl.nativeElement.click();

        testHostFixture.detectChanges();

        expect(linkEl.attributes.href).toEqual('http://dasch.swiss/');
        expect(testHostComponent.label).toEqual('DaSCH website');
    });
});
