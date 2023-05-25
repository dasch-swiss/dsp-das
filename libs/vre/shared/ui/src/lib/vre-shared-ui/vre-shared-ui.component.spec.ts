import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VreSharedUiComponent } from './vre-shared-ui.component';

describe('VreSharedUiComponent', () => {
    let component: VreSharedUiComponent;
    let fixture: ComponentFixture<VreSharedUiComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [VreSharedUiComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(VreSharedUiComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
