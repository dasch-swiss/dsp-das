import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddRemoveFormComponentComponent } from './add-remove-form-component.component';

describe('AddRemoveFormComponentComponent', () => {
    let component: AddRemoveFormComponentComponent;
    let fixture: ComponentFixture<AddRemoveFormComponentComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddRemoveFormComponentComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AddRemoveFormComponentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
