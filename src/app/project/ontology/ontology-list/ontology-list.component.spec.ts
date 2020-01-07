import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatSelectModule } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KnoraApiConnection } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule } from '@knora/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { TestConfig } from 'test.config';
import { OntologyListComponent } from './ontology-list.component';

describe('OntologyListComponent', () => {
    let component: OntologyListComponent;
    let fixture: ComponentFixture<OntologyListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                OntologyListComponent
            ],
            imports: [
                HttpClientTestingModule,
                KuiCoreModule,
                MatDialogModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatSelectModule,
                ReactiveFormsModule,
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
                                        return TestConfig.ProjectCode;
                                    }
                                }
                            })
                        }
                    }
                },
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

    beforeEach(() => {
        fixture = TestBed.createComponent(OntologyListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
