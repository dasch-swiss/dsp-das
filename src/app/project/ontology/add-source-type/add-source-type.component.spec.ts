import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSourceTypeComponent } from './add-source-type.component';
import { MatIconModule, MatMenuModule, MatDialogModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

describe('AddSourceTypeComponent', () => {
    let component: AddSourceTypeComponent;
    let fixture: ComponentFixture<AddSourceTypeComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                AddSourceTypeComponent
            ],
            imports: [
                MatDialogModule,
                MatIconModule,
                MatMenuModule,
                ReactiveFormsModule
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AddSourceTypeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
