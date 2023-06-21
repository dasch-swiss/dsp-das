import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormattedTextValueComponent } from './formatted-text-value.component';

describe('FormattedTextValueComponent', () => {
    let component: FormattedTextValueComponent;
    let fixture: ComponentFixture<FormattedTextValueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FormattedTextValueComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FormattedTextValueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
