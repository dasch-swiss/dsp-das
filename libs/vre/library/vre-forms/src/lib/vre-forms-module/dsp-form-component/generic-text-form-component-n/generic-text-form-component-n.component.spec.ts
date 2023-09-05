import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenericTextFormComponentNComponent } from './generic-text-form-component-n.component';

describe('GenericTextFormComponentNComponent', () => {
    let component: GenericTextFormComponentNComponent;
    let fixture: ComponentFixture<GenericTextFormComponentNComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GenericTextFormComponentNComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(GenericTextFormComponentNComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
