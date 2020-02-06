import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConnection, ReadProject, ProjectResponse, ApiResponseData, ProjectsResponse } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken } from '@knora/core';
import { TestConfig } from 'test.config';
import { AppInitService } from '../app-init.service';
import { FooterComponent } from './footer/footer.component';
import { GridComponent } from './grid/grid.component';
import { MainComponent } from './main.component';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('MainComponent', () => {
    let component: MainComponent;
    let fixture: ComponentFixture<MainComponent>;
    let element: HTMLElement;
    let projectSpy: jasmine.Spy;

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
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: KnoraApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                }
            ]
        }).compileComponents();
    }));

    beforeEach(inject([KnoraApiConnectionToken], (knoraApiConn) => {
        projectSpy = spyOn(knoraApiConn.admin.projectsEndpoint, 'getProjects').and.callFake(
            () => {
                const projectList = {
                    body: {
                        projects: [
                            {
                                id: 'http://rdfh.ch/projects/0801',
                                description: [
                                    {
                                        value: 'Bernoulli-Euler Online'
                                    }
                                ],
                                keywords: [],
                                logo: null,
                                longname: 'Bernoulli-Euler Online',
                                ontologies: [
                                    'http://www.knora.org/ontology/0801/leibniz',
                                    'http://www.knora.org/ontology/0801/biblio',
                                    'http://www.knora.org/ontology/0801/newton',
                                    'http://www.knora.org/ontology/0801/beol'
                                ],
                                selfjoin: false,
                                shortcode: '0801',
                                shortname: 'beol',
                                status: true
                            },
                            {
                                id: 'http://rdfh.ch/projects/0001',
                                description: [
                                    {
                                        value: 'Anything Project'
                                    }
                                ],
                                keywords: [],
                                logo: null,
                                longname: 'Anything Project',
                                ontologies: [
                                    'http://www.knora.org/ontology/0001/anything',
                                    'http://www.knora.org/ontology/0001/minimal',
                                    'http://www.knora.org/ontology/0001/something'
                                ],
                                selfjoin: false,
                                shortcode: '0001',
                                shortname: 'anything',
                                status: true
                            }
                        ]
                    }
                };

                return of(projectList);
            });

        fixture = TestBed.createComponent(MainComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement; // the HTML reference
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(projectSpy).toHaveBeenCalledTimes(1);
    });

    it('should display the title "bring everything together and simplify your research"', () => {
        const h1 = element.querySelector('h1.app-headline');
        expect(h1.textContent).toEqual('bring everything together and simplify your research');
        expect(projectSpy).toHaveBeenCalledTimes(1);
    });

    it('should load projects', () => {
        expect(projectSpy).toHaveBeenCalledTimes(1);

        expect(component.projects[0].title).toEqual('Bernoulli-Euler Online');
        expect(component.projects[0].url).toEqual('project/0801');
    });

    it('should display the cookie banner', () => {
        const cookieBanner = fixture.debugElement.query(By.css('div.cookie-banner'));
        const acceptBtn = fixture.debugElement.query(By.css('div.action button'));

        expect(cookieBanner).toBeDefined();
        expect(acceptBtn.nativeElement.innerText).toEqual('ACCEPT');

        // todo: find a way to check if the banner is gone after clicking on the button
        /* acceptBtn.triggerEventHandler('click', {});
        fixture.detectChanges(); */

    });

});
