import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VreProfileComponent } from './vre-profile.component';

describe('VreProfileComponent', () => {
    let component: VreProfileComponent;
    let fixture: ComponentFixture<VreProfileComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VreProfileComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VreProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
