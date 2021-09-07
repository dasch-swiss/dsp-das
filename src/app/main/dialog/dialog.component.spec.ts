import { CommonModule } from '@angular/common';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ListInfoFormComponent } from 'src/app/project/list/list-info-form/list-info-form.component';
import { ListItemFormComponent } from 'src/app/project/list/list-item-form/list-item-form.component';
import { ListItemComponent } from 'src/app/project/list/list-item/list-item.component';
import { OntologyFormComponent } from 'src/app/project/ontology/ontology-form/ontology-form.component';
import { PropertyFormComponent } from 'src/app/project/ontology/property-form/property-form.component';
import { ResourceClassFormComponent } from 'src/app/project/ontology/resource-class-form/resource-class-form.component';
import { ProjectFormComponent } from 'src/app/project/project-form/project-form.component';
import { MembershipComponent } from 'src/app/user/membership/membership.component';
import { PasswordFormComponent } from 'src/app/user/user-form/password-form/password-form.component';
import { UserFormComponent } from 'src/app/user/user-form/user-form.component';
import { ErrorComponent } from '../error/error.component';
import { DialogHeaderComponent } from './dialog-header/dialog-header.component';
import { DialogComponent } from './dialog.component';

describe('DialogComponent', () => {
    let component: DialogComponent;
    let fixture: ComponentFixture<DialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                DialogComponent,
                DialogHeaderComponent,
                ErrorComponent,
                UserFormComponent,
                MembershipComponent,
                PasswordFormComponent,
                ProjectFormComponent,
                ListItemComponent,
                ListItemFormComponent,
                ListInfoFormComponent,
                OntologyFormComponent,
                ResourceClassFormComponent,
                PropertyFormComponent
            ],
            imports: [
                CommonModule,
                MatAutocompleteModule,
                MatButtonModule,
                MatChipsModule,
                MatDialogModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatListModule,
                MatSelectModule,
                MatSlideToggleModule,
                MatTooltipModule,
                MatTreeModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: [] }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
