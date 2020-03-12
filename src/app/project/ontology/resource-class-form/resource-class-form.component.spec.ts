import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule, MatOptionModule, MatSelectModule, MatSlideToggleModule, MatTooltipModule } from '@angular/material';
import { KuiActionModule } from '@knora/action';
import { KnoraApiConnection } from '@knora/api';
import { KnoraApiConfigToken, KnoraApiConnectionToken } from '@knora/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppInitService } from 'src/app/app-init.service';
import { TestConfig } from 'test.config';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { ResourceClassFormComponent } from './resource-class-form.component';

describe('ResourceClassFormComponent', () => {
    let component: ResourceClassFormComponent;
    let fixture: ComponentFixture<ResourceClassFormComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ResourceClassFormComponent,
                PropertyFormComponent
            ],
            imports: [
                HttpClientTestingModule,
                KuiActionModule,
                MatAutocompleteModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                MatTooltipModule,
                ReactiveFormsModule,
                TranslateModule.forRoot()
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

    beforeEach(() => {
        fixture = TestBed.createComponent(ResourceClassFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
