import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { ReplaceFileFormComponent } from './replace-file-form.component';

describe('ReplaceFileFormComponent', () => {
    let component: ReplaceFileFormComponent;
    let fixture: ComponentFixture<ReplaceFileFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ ReplaceFileFormComponent ],
            imports: [ TranslateModule.forRoot() ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ReplaceFileFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
