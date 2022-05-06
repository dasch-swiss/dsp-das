import { Component, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HealthEndpointSystem, MockHealth } from '@dasch-swiss/dsp-js';
import { of } from 'rxjs';
import { StatusMsg } from 'src/assets/http/statusMsg';
import { DspApiConnectionToken } from '../declarations/dsp-api-tokens';
import { ErrorComponent } from './error.component';

/**
 * test host component to simulate parent component.
 * dsp specific http status message
 */
@Component({
    template: `
        <app-error #error [status]="204"></app-error>`
})
class NoContentTestHostComponent implements OnInit {

    @ViewChild('error', { static: false }) errorComponent: ErrorComponent;

    constructor() {
    }

    ngOnInit() { }
}

/**
 * test host component to simulate parent component.
 * default http status message
 */
@Component({
    template: `
        <app-error #error [status]="418"></app-error>`
})
class TeapotTestHostComponent implements OnInit {

    @ViewChild('error', { static: false }) errorComponent: ErrorComponent;

    constructor() {
    }

    ngOnInit() { }
}

describe('ErrorComponent', () => {
    let noContentTestHostComponent: NoContentTestHostComponent;
    let noContentTestHostFixture: ComponentFixture<NoContentTestHostComponent>;

    let teapotTestHostComponent: TeapotTestHostComponent;
    let teapotTestHostFixture: ComponentFixture<TeapotTestHostComponent>;

    let status: StatusMsg;

    const apiEndpointSpyObj = {
        system: {
            healthEndpoint: jasmine.createSpyObj('healthEndpoint', ['getHealthStatus'])
        }
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                ErrorComponent,
                NoContentTestHostComponent,
                TeapotTestHostComponent
            ],
            imports: [
                BrowserAnimationsModule,
                MatIconModule,
                RouterTestingModule
            ],
            providers: [
                StatusMsg,
                {
                    provide: MatDialogRef,
                    useValue: {}
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: apiEndpointSpyObj
                },
            ]
        }).compileComponents();

        status = TestBed.inject(StatusMsg);

    }));

    beforeEach(() => {
        noContentTestHostFixture = TestBed.createComponent(NoContentTestHostComponent);
        noContentTestHostComponent = noContentTestHostFixture.componentInstance;
        noContentTestHostFixture.detectChanges();

        teapotTestHostFixture = TestBed.createComponent(TeapotTestHostComponent);
        teapotTestHostComponent = teapotTestHostFixture.componentInstance;
        teapotTestHostFixture.detectChanges();

        const dspConnSpy = TestBed.inject(DspApiConnectionToken);
        (dspConnSpy.system.healthEndpoint as jasmine.SpyObj<HealthEndpointSystem>).getHealthStatus.and.callFake(
            () => {
                const health = MockHealth.mockRunning();
                return of(health);
            }
        );
    });

    it('should create', () => {
        expect(noContentTestHostComponent).toBeTruthy();
    });

    it('should display "warning 204 | no content"', () => {
        expect(noContentTestHostComponent.errorComponent).toBeTruthy();
        expect(noContentTestHostComponent.errorComponent.message.status).toEqual(204);
        expect(noContentTestHostComponent.errorComponent.message.type).toEqual('warning');

        const hostCompDe = noContentTestHostFixture.debugElement;

        const messageEl = hostCompDe.query(By.directive(ErrorComponent));

        const titleEle = messageEl.query(By.css('.mat-title'));

        expect(titleEle.nativeElement.innerText).toEqual('WARNING 204 | No Content');
    });

    it('should display "error 418 | I\'m a teapot"', () => {
        expect(teapotTestHostComponent.errorComponent).toBeTruthy();
        expect(teapotTestHostComponent.errorComponent.message.status).toEqual(418);
        expect(teapotTestHostComponent.errorComponent.message.type).toEqual('error');

        const hostCompDe = teapotTestHostFixture.debugElement;

        const messageEl = hostCompDe.query(By.directive(ErrorComponent));

        const titleEle = messageEl.query(By.css('.mat-title'));

        expect(titleEle.nativeElement.innerText).toEqual('ERROR 418 | I\'m a teapot');
    });

    // todo: check the input, check the switch (display 403 template if we get a 403 error, same for 404)
});
