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
                            },
                            {
                                id: 'http://rdfh.ch/projects/0803',
                                description: [
                                    {
                                        value: '<p>Das interdisziplinäre Forschungsprojekt "<b><em>Die Bilderfolgen der Basler Frühdrucke: Spätmittelalterliche Didaxe als Bild-Text-Lektüre</em></b>" verbindet eine umfassende kunstwissenschaftliche Analyse der Bezüge zwischen den Bildern und Texten in den illustrierten Basler Inkunabeln mit der Digitalisierung der Bestände der Universitätsbibliothek und der Entwicklung einer elektronischen Edition in der Form einer neuartigen Web-0.2-Applikation. </p> <p>Das Projekt wird durchgeführt vom <a href="http://kunsthist.unibas.ch">Kunsthistorischen Seminar</a> der Universität Basel (Prof. B. Schellewald) und dem <a href="http://www.dhlab.unibas.ch">Digital Humanities Lab</a> der Universität Basel (PD Dr. L. Rosenthaler). </p> <p> Das Kernstück der digitalen Edition besteht aus rund zwanzig reich bebilderten Frühdrucken aus vier verschiedenen Basler Offizinen. Viele davon sind bereits vor 1500 in mehreren Ausgaben erschienen, einige fast gleichzeitig auf Deutsch und Lateinisch. Es handelt sich um eine ausserordentlich vielfältige Produktion; neben dem Heilsspiegel finden sich ein Roman, die Melusine, die Reisebeschreibungen des Jean de Mandeville, einige Gebets- und Erbauungsbüchlein, theologische Schriften, Fastenpredigten, die Leben der Heiligen Fridolin und Meinrad, das berühmte Narrenschiff sowie die Exempelsammlung des Ritters vom Thurn. </p> Die Internetpublikation macht das digitalisierte Korpus dieser Frühdrucke durch die Möglichkeiten nichtlinearer Verknüpfung und Kommentierung der Bilder und Texte, für die wissenschaftliche Edition sowie für die Erforschung der Bilder und Texte nutzbar machen. Auch können bereits bestehende und entstehende Online-Editionen damit verknüpft werden , wodurch die Nutzung von Datenbanken anderer Institutionen im Hinblick auf unser Corpus optimiert wird. </p>'
                                    }
                                ],
                                keywords: [
                                    'Basel',
                                    'Basler Frühdrucke',
                                    'Bilderfolgen',
                                    'Contectualisation of images',
                                    'Inkunabel',
                                    'Kunsthistorisches Seminar Universität Basel',
                                    'Late Middle Ages',
                                    'Letterpress Printing',
                                    'Narrenschiff',
                                    'Sebastian Brant',
                                    'Wiegendrucke',
                                    'early print',
                                    'incunabula',
                                    'ship of fools'
                                ],
                                logo: ['incunabula_logo.png'],
                                longname: 'Bilderfolgen Basler Frühdrucke',
                                ontologies: [
                                    'http://www.knora.org/ontology/0803/incunabula'
                                ],
                                selfjoin: false,
                                shortcode: '0803',
                                shortname: 'incunabula',
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
        expect(component.projects.length).toEqual(2);

        expect(component.projects[0].title).toEqual('Bernoulli-Euler Online');
        expect(component.projects[0].url).toEqual('project/0801');

        expect(component.projects[1].title).toEqual('Bilderfolgen Basler Frühdrucke');
        expect(component.projects[1].url).toEqual('project/0803');
    });

    it('should not display the Anything project in the list', () => {
        expect(projectSpy).toHaveBeenCalledTimes(1);
        expect(component.projects.length).toEqual(2);

        expect(component.projects[0].title).not.toMatch('Anything Project');
        expect(component.projects[1].title).not.toMatch('Anything Project');

    });

    it('should display the cookie banner', () => {
        const cookieBanner = fixture.debugElement.query(By.css('div.cookie-banner'));
        const acceptBtn = fixture.debugElement.query(By.css('div.action button'));

        expect(cookieBanner).toBeDefined();
        expect(acceptBtn.nativeElement.innerText).toEqual('ACCEPT');

        // todo: find a way to check if the banner is gone after clicking on the button
        /* acceptBtn.triggerEventHandler('click', {});
        fixture.detectChanges();
        expect(cookieBanner).toBeUndefined(); */
    });

});
