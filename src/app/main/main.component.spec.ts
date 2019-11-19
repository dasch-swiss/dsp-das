import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConnection, KnoraApiConfig } from '@knora/api';
import { KnoraApiConnectionToken, KnoraApiConfigToken } from '@knora/core';
import { AppInitService } from '../app-init.service';
import { FooterComponent } from './footer/footer.component';
import { GridComponent } from './grid/grid.component';
import { MainComponent } from './main.component';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [MainComponent, FooterComponent, GridComponent],
            imports: [
                KuiActionModule,
                MatButtonModule,
                MatIconModule,
                MatFormFieldModule,
                MatSelectModule,
                MatDividerModule,
                RouterTestingModule
            ],
            providers: [
                AppInitService,
                {
                    provide: KnoraApiConfigToken,
                    useValue: KnoraApiConfig
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: KnoraApiConnection
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        // console.log()

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
