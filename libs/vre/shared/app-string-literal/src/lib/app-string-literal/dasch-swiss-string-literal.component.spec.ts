import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DaschSwissStringLiteralComponent } from './vre-string-literal.component';

describe('AppStringLiteralComponent', () => {
    let component: DaschSwissStringLiteralComponent;
    let fixture: ComponentFixture<DaschSwissStringLiteralComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DaschSwissStringLiteralComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(DaschSwissStringLiteralComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
