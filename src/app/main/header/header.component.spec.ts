import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConfig, KnoraApiConnection } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule } from '@knora/core';
import { KuiSearchModule } from '@knora/search';
import { TranslateModule } from '@ngx-translate/core';
import { UserMenuComponent } from 'src/app/user/user-menu/user-menu.component';
import { SelectLanguageComponent } from '../select-language/select-language.component';
import { HeaderComponent } from './header.component';
import { HttpClientModule } from '@angular/common/http';
import { AppInitService } from 'src/app/app-init.service';

fdescribe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    const config = new KnoraApiConfig('http', '0.0.0.0', 3333);

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                HeaderComponent,
                SelectLanguageComponent,
                UserMenuComponent
            ],
            imports: [
                HttpClientModule,
                KuiActionModule,
                KuiCoreModule,
                KuiSearchModule,
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
                    provide: KnoraApiConfigToken,
                    useValue: config
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: new KnoraApiConnection(config)
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
