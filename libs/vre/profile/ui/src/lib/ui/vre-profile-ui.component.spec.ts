import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VreProfileUiComponent } from './vre-profile-ui.component';

describe('VreProfileUiComponent', () => {
    let component: VreProfileUiComponent;
    let fixture: ComponentFixture<VreProfileUiComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VreProfileUiComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VreProfileUiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
