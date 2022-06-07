import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyClassItemComponent } from './ontology-class-item.component';

describe('OntologyClassItemComponent', () => {
    let component: OntologyClassItemComponent;
    let fixture: ComponentFixture<OntologyClassItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ OntologyClassItemComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyClassItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
