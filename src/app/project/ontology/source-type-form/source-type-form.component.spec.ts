import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatOptionModule, MatSelectModule, MatSlideToggleModule } from '@angular/material';
import { KuiActionModule } from '@knora/action';
import { TranslateModule } from '@ngx-translate/core';
import { SourceTypeFormComponent } from './source-type-form.component';
import { SourceTypePropertyComponent } from './source-type-property/source-type-property.component';

fdescribe('SourceTypeFormComponent', () => {
    let component: SourceTypeFormComponent;
    let fixture: ComponentFixture<SourceTypeFormComponent>;

    let propertyForm: FormGroup;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SourceTypeFormComponent,
                SourceTypePropertyComponent
            ],
            imports: [
                HttpClientTestingModule,
                KuiActionModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                ReactiveFormsModule,
                TranslateModule.forRoot()
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SourceTypeFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
