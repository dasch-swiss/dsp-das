import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceTypePropertyComponent } from './source-type-property.component';
import { MatFormFieldModule, MatSelectModule, MatOptionModule, MatSlideToggleModule, MatIconModule, MatInputModule } from '@angular/material';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SourceTypePropertyComponent', () => {
    let component: SourceTypePropertyComponent;
    let fixture: ComponentFixture<SourceTypePropertyComponent>;

    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SourceTypePropertyComponent],
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                ReactiveFormsModule
            ],
            providers: [
                // reference the new instance of formBuilder from above
                { provide: FormBuilder, useValue: formBuilder }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceTypePropertyComponent);
        component = fixture.componentInstance;

        // pass in the form dynamically
        component.propertyForm = formBuilder.group({
            type: null,
            label: null,
            multiple: null,
            required: null,
            permission: null
        });

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
