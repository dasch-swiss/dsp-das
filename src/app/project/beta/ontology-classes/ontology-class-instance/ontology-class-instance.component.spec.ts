import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyClassInstanceComponent } from './ontology-class-instance.component';

describe('OntologyClassInstanceComponent', () => {
    let component: OntologyClassInstanceComponent;
    let fixture: ComponentFixture<OntologyClassInstanceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ OntologyClassInstanceComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyClassInstanceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
