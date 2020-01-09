import { inject } from '@angular/core/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConfig, KnoraApiConnection, ApiResponseData, ProjectsResponse, Project, StringLiteral, ReadProject } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken } from '@knora/core';
import { AppInitService } from '../app-init.service';
import { FooterComponent } from './footer/footer.component';
import { GridComponent } from './grid/grid.component';
import { MainComponent } from './main.component';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let element: HTMLElement;

    const config = new KnoraApiConfig('http', '0.0.0.0', 3333);
    const knoraApiConnection = new KnoraApiConnection(config);

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
                    useValue: config
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: knoraApiConnection
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement; // the HTML reference
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display the title "bring all together and simplify your research"', () => {
        const h1 = element.querySelector('h1.app-headline');
        expect(h1.textContent).toEqual('bring all together and simplify your research');
    });

    /* xit('should display public projects', inject([KnoraApiConnectionToken], (knoraApiConn) => {
        const projectSpy = spyOn(knoraApiConn.admin.projectsEndpoint, 'getProjects').and.callFake(
            () => {
                // TODO: mock data
            });

        expect(component).toBeTruthy();
    })); */

    // it should show the cookie banner, display Accept button, not shown again when clicking (show it once, after clicking, not displayed anymore even when the page is refreshed)
});
