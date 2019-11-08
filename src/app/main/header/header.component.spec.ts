import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConfig } from '@knora/api';
import { KnoraApiConnectionToken, KuiConfig, KuiConfigToken, KuiCoreModule } from '@knora/core';
import { KuiSearchModule } from '@knora/search';
import { TranslateModule } from '@ngx-translate/core';
import { UserMenuComponent } from 'src/app/user/user-menu/user-menu.component';
import { SelectLanguageComponent } from '../select-language/select-language.component';
import { HeaderComponent } from './header.component';
import { AppInitService } from 'src/app/app-init.service';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                HeaderComponent,
                SelectLanguageComponent,
                UserMenuComponent
            ],
            imports: [
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
                {
                    provide: KuiConfigToken,
                    useValue: AppInitService.kuiConfig
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: KnoraApiConfig
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
