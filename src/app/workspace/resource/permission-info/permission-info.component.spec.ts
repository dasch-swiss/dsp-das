import { OverlayModule } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionInfoComponent } from './permission-info.component';


fdescribe('PermissionInfoComponent', () => {
    let component: PermissionInfoComponent;
    let fixture: ComponentFixture<PermissionInfoComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                OverlayModule
            ],
            declarations: [
                PermissionInfoComponent
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PermissionInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
