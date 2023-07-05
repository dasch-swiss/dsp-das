import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OntoResourceFormComponent } from './onto-resource-form.component';

describe('OntoResourceFormComponent', () => {
    let component: OntoResourceFormComponent;
    let fixture: ComponentFixture<OntoResourceFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [OntoResourceFormComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(OntoResourceFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
