import { HttpClientTestingModule } from '@angular/common/http/testing';
import { waitForAsync, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { TranslateModule } from '@ngx-translate/core';
import { TestConfig } from 'test.config';
import { AppInitService } from './app-init.service';
import { AppComponent } from './app.component';
import { DspApiConfigToken, DspApiConnectionToken, DspInstrumentationToken } from './main/declarations/dsp-api-tokens';
import { DspDataDogConfig, DspInstrumentationConfig } from './main/declarations/dsp-instrumentation-config';
import { HeaderComponent } from './main/header/header.component';
import { SelectLanguageComponent } from './main/select-language/select-language.component';
import { UserMenuComponent } from './user/user-menu/user-menu.component';

describe('AppComponent', () => {

    beforeEach(waitForAsync(() => {

        const dspDatadogSpy = new DspDataDogConfig(false, '', '', '', '');

        const instrumentationConfig: DspInstrumentationConfig = {
            environment: 'dev',
            dataDog: {
                enabled: false,
                applicationId: 'app_id',
                clientToken: 'client_token',
                site: 'site',
                service: 'dsp-app'
            },
            rollbar: {
                enabled: false,
                accessToken: 'rollbar_token'
            }
        };

        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                HeaderComponent,
                SelectLanguageComponent,
                UserMenuComponent
            ],
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                MatIconModule,
                MatListModule,
                MatMenuModule,
                MatSnackBarModule,
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
                {
                    provide: DspInstrumentationToken,
                    useValue: instrumentationConfig
                },
            ]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });
});
