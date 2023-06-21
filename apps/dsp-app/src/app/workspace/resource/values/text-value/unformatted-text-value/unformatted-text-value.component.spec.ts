import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnformattedTextValueComponent } from './unformatted-text-value.component';

describe('UnformattedTextValueComponent', () => {
    let component: UnformattedTextValueComponent;
    let fixture: ComponentFixture<UnformattedTextValueComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UnformattedTextValueComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(UnformattedTextValueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
