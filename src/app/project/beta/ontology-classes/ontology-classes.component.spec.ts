import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyClassesComponent } from './ontology-classes.component';

describe('OntologyClassesComponent', () => {
    let component: OntologyClassesComponent;
    let fixture: ComponentFixture<OntologyClassesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ OntologyClassesComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyClassesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
