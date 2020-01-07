import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceTypePropertyComponent } from './source-type-property.component';
import { MatFormFieldModule, MatSelectModule, MatOptionModule, MatSlideToggleModule, MatIconModule, MatInputModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

fdescribe('SourceTypePropertyComponent', () => {
    let component: SourceTypePropertyComponent;
    let fixture: ComponentFixture<SourceTypePropertyComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceTypePropertyComponent],
            imports: [
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                ReactiveFormsModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceTypePropertyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
