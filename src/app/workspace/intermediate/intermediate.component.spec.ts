import { Component, DebugElement, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { FilteredResouces } from '@dasch-swiss/dsp-ui';

import { IntermediateComponent } from './intermediate.component';


/**
 * test host component to simulate parent component
 */
@Component({
    template: '<app-intermediate #intermediateView [resources]="resources"></app-intermediate>'
})
class ThreeSelectedResourcesComponent {

    @ViewChild('intermediateView') intermediateComponent: IntermediateComponent;

    resources: FilteredResouces = {
        'count': 3,
        'resListIndex': [3, 2, 1],
        'resIds': [
            'http://rdfh.ch/0803/83616f8d8501',
            'http://rdfh.ch/0803/71e0b9958a01',
            'http://rdfh.ch/0803/683d5cd26f01'
        ],
        'selectionType': 'multiple'
    };

    constructor() { }

}


describe('IntermediateComponent', () => {

    let hostComponent: ThreeSelectedResourcesComponent;
    let hostFixture: ComponentFixture<ThreeSelectedResourcesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                IntermediateComponent,
                ThreeSelectedResourcesComponent
            ],
            imports: [
                MatButtonModule,
                MatIconModule
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        hostFixture = TestBed.createComponent(ThreeSelectedResourcesComponent);
        hostComponent = hostFixture.componentInstance;
        hostFixture.detectChanges();

        expect(hostComponent).toBeTruthy();

    });

    it('expect count to be "3" and compare button to be enabled', () => {
        expect(hostComponent.intermediateComponent).toBeTruthy();
        expect(hostComponent.intermediateComponent.resources).toBeDefined();

        const hostCompDe = hostFixture.debugElement;

        const count: DebugElement = hostCompDe.query(By.css('.count'));
        expect(count.nativeElement.innerText).toEqual('3');

        const button: DebugElement = hostCompDe.query(By.css('.compare'));
        expect(button.nativeElement.disabled).toBeFalsy();
    });
});
