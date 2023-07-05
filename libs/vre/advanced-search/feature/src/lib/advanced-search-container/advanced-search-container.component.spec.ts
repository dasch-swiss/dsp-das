import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancedSearchContainerComponent } from './advanced-search-container.component';

describe('AdvancedSearchContainerComponent', () => {
    let component: AdvancedSearchContainerComponent;
    let fixture: ComponentFixture<AdvancedSearchContainerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdvancedSearchContainerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AdvancedSearchContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
