import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OntologyListComponent } from './ontology-list.component';
import { KuiCoreModule, KuiConfigToken, KuiCoreConfig } from '@knora/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('OntologyListComponent', () => {
    let component: OntologyListComponent;
    let fixture: ComponentFixture<OntologyListComponent>;

    const shortcode = '0001';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OntologyListComponent],
            imports: [
                KuiCoreModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        parent: {
                            paramMap: of({
                                get: (param: string) => {
                                    if (param === 'shortcode') {
                                        return shortcode;
                                    }
                                }
                            })
                        }
                    }
                },
                {
                    provide: KuiConfigToken,
                    useValue: KuiCoreConfig
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
