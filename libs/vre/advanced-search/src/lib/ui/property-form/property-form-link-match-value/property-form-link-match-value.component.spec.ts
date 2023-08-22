import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertyFormLinkMatchValueComponent } from './property-form-link-match-value.component';

describe('PropertyFormLinkMatchValueComponent', () => {
    let component: PropertyFormLinkMatchValueComponent;
    let fixture: ComponentFixture<PropertyFormLinkMatchValueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PropertyFormLinkMatchValueComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PropertyFormLinkMatchValueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
