import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLinkResourceComponent } from './create-link-resource.component';

describe('CreateLinkResourceComponent', () => {
    let component: CreateLinkResourceComponent;
    let fixture: ComponentFixture<CreateLinkResourceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ CreateLinkResourceComponent ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateLinkResourceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
