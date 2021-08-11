import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import {
    AppInitService,
    DspActionModule,
    DspApiConfigToken,
    DspApiConnectionToken,
    DspCoreModule,
    DspSearchModule
} from '@dasch-swiss/dsp-ui';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentCommunicationEventService, EmitEvent, Events } from 'src/app/main/services/component-communication-event.service';
import { UserMenuComponent } from 'src/app/user/user-menu/user-menu.component';
import { TestConfig } from 'test.config';
import { SelectLanguageComponent } from '../select-language/select-language.component';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let componentCommsService: ComponentCommunicationEventService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                HeaderComponent,
                SelectLanguageComponent,
                UserMenuComponent
            ],
            imports: [
                BrowserAnimationsModule,
                HttpClientModule,
                DspActionModule,
                DspCoreModule,
                DspSearchModule,
                MatIconModule,
                MatListModule,
                MatMenuModule,
                MatToolbarModule,
                RouterTestingModule,
                TranslateModule.forRoot()
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                },
                ComponentCommunicationEventService
            ]
        }).compileComponents();

        componentCommsService = TestBed.inject(ComponentCommunicationEventService);
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the lamp icon button', () => {
        const lampIconBtn = fixture.debugElement.query(By.css('button.home-button'));
        expect(lampIconBtn).toBeDefined();
    });

    it('should display the link to the help page', () => {
        const helpBtn = fixture.debugElement.query(By.css('button.help'));
        expect(helpBtn).toBeDefined();

        const helpBtnLabel = helpBtn.nativeElement.innerHTML;
        expect(helpBtnLabel).toEqual('Help');
    });

    it('should display the login button', () => {
        const loginBtn = fixture.debugElement.query(By.css('button.login-button'));
        expect(loginBtn).toBeDefined();

        const loginBtnLabel = loginBtn.nativeElement.innerHTML;
        expect(loginBtnLabel).toEqual('LOGIN');
    });

    it('should display fulltext-search', () => {
        const searchPanel = fixture.debugElement.query(By.css('dsp-fulltext-search-panel'));
        expect(searchPanel).toBeDefined();
    });

    it('should subscribe to component communication when the loginSuccess event is emitted', () => {
        componentCommsService.emit(new EmitEvent(Events.loginSuccess));
        fixture.detectChanges();
        expect(component.componentCommsSubscription.closed).toBe(false);
    });

    it('should unsubscribe from changes on destruction', () => {

        expect(component.componentCommsSubscription.closed).toBe(false);

        fixture.destroy();

        expect(component.componentCommsSubscription.closed).toBe(true);

    });

});
