import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRegionFormComponent } from './add-region-form.component';

describe('AddRegionFormComponent', () => {
    let component: AddRegionFormComponent;
    let fixture: ComponentFixture<AddRegionFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ AddRegionFormComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddRegionFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
