import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';

import { OntologyComponent } from './ontology.component';

describe('OntologyComponent', () => {
    let component: OntologyComponent;
    let fixture: ComponentFixture<OntologyComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OntologyComponent],
            imports: [
                KuiActionModule,
                MatCardModule,
                RouterTestingModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
