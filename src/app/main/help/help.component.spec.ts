import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiCoreConfig, KuiConfigToken } from '@knora/core';
import { FooterComponent } from '../footer/footer.component';
import { GridComponent } from '../grid/grid.component';
import { HelpComponent } from './help.component';


describe('HelpComponent', () => {
    let component: HelpComponent;
    let fixture: ComponentFixture<HelpComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HelpComponent, FooterComponent, GridComponent],
            imports: [
                HttpClientTestingModule,
                MatButtonModule,
                MatIconModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: KuiConfigToken,
                    useValue: KuiCoreConfig
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
