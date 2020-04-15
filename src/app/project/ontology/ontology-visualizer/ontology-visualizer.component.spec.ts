import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatOptionModule, MatSelectModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OnInit, Component, ViewChild, DebugElement } from '@angular/core';
import { KuiActionModule } from '@knora/action';
import {ClassDefinition, KnoraApiConnection, ReadOntology} from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken, KuiCoreModule } from '@knora/core';
import { of } from 'rxjs';
import { AppInitService } from 'src/app/app-init.service';
import { ErrorComponent } from 'src/app/main/error/error.component';
import { TestConfig } from 'test.config';
import { OntologyVisualizerComponent } from './ontology-visualizer.component';
import {OntologyComponent} from '../ontology.component';

describe('OntologyVisualizerComponent', () => {
    let component: OntologyVisualizerComponent;
    let fixture: ComponentFixture<OntologyVisualizerComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                OntologyComponent,
                ErrorComponent
            ],
            imports: [
                HttpClientTestingModule,
                KuiActionModule,
                KuiCoreModule,
                MatCardModule,
                MatDialogModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatMenuModule,
                MatOptionModule,
                MatSelectModule,
                MatToolbarModule,
                MatTooltipModule,
                ReactiveFormsModule,
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
        })
            .compileComponents();
    }));
});
