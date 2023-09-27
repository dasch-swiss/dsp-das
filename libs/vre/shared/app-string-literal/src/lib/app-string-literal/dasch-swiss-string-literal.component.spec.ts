import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppStringLiteralComponent } from './dasch-swiss-string-literal.component';

describe('AppStringLiteralComponent', () => {
    let component: AppStringLiteralComponent;
    let fixture: ComponentFixture<AppStringLiteralComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppStringLiteralComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AppStringLiteralComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
