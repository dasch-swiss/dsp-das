import { OverlayModule } from '@angular/cdk/overlay';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockResource, ReadResource } from '@dasch-swiss/dsp-js';
import { PermissionInfoComponent } from './permission-info.component';

/**
 * test host component to simulate parent component
 */
@Component({
    template: '<app-permissions-info #permissionInfo [hasPermissions]="resource.hasPermissions" [userHasPermission]="resource.userHasPermission"></app-permissions-info>'
})
class TestHostComponent implements OnInit {

    @ViewChild('permissionInfo') permissionInfoComponent: PermissionInfoComponent;

    // get a resource from DSP-JS-Lib test data
    resource: ReadResource;
    constructor(
    ) {

    }

    ngOnInit() {
        MockResource.getTestThing().subscribe(
            (response: ReadResource) => {
                this.resource = response;
                // has permissions: CR knora-admin:Creator|M knora-admin:ProjectMember|V knora-admin:KnownUser|RV knora-admin:UnknownUser
                // user has permisson: RV
            }
        );

    }

}

describe('PermissionInfoComponent', () => {
    let testHostComponent: TestHostComponent;
    let testHostFixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatButtonModule,
                MatIconModule,
                MatTooltipModule,
                OverlayModule
            ],
            declarations: [
                PermissionInfoComponent,
                TestHostComponent
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        testHostFixture = TestBed.createComponent(TestHostComponent);
        testHostComponent = testHostFixture.componentInstance;
        testHostFixture.detectChanges();
    });

    it('should create', () => {
        expect(testHostComponent.permissionInfoComponent).toBeTruthy();
    });
});
