import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatSelectModule } from '@angular/material/select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import {
    KnoraApiConnection,
    MockOntology,
    ReadOntology,
    StringLiteral,
} from '@dasch-swiss/dsp-js';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppInitService } from '@dsp-app/src/app/app-init.service';
import { CacheService } from '@dsp-app/src/app/main/cache/cache.service';
import {
    DspApiConfigToken,
    DspApiConnectionToken,
} from '@dsp-app/src/app/main/declarations/dsp-api-tokens';
import { DialogComponent } from '@dsp-app/src/app/main/dialog/dialog.component';
import { StatusComponent } from '@dsp-app/src/app/main/status/status.component';
import { TestConfig } from '@dsp-app/src/test.config';
import { PropertyFormComponent } from '../property-form/property-form.component';
import { ResourceClassFormComponent } from './resource-class-form.component';

/**
 * test host component to simulate parent component.
 */
@Component({
    template: '<app-resource-class-form></app-resource-class-form>',
})
class TestHostResourceClassFormComponent {}

@Component({ selector: 'app-string-literal-input', template: '' })
class MockStringLiteralInputComponent {
    @Input() placeholder = 'Label';
    @Input() language: string;
    @Input() textarea: boolean;
    @Input() value: StringLiteral[] = [];
    @Input() disabled: boolean;
    @Input() readonly: boolean;
}

describe('ResourceClassFormComponent', () => {
    let component: TestHostResourceClassFormComponent;
    let fixture: ComponentFixture<TestHostResourceClassFormComponent>;

    const cacheServiceSpy = jasmine.createSpyObj('CacheService', ['get']);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                TestHostResourceClassFormComponent,
                MockStringLiteralInputComponent,
                ResourceClassFormComponent,
                PropertyFormComponent,
                DialogComponent,
                StatusComponent,
            ],
            imports: [
                BrowserAnimationsModule,
                HttpClientTestingModule,
                MatAutocompleteModule,
                MatDialogModule,
                MatDividerModule,
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                MatListModule,
                MatOptionModule,
                MatSelectModule,
                MatSlideToggleModule,
                MatSnackBarModule,
                MatTooltipModule,
                ReactiveFormsModule,
                RouterTestingModule,
                TranslateModule.forRoot(),
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig,
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig),
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceSpy,
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        // mock cache service for currentOntology
        const cacheSpy = TestBed.inject(CacheService);

        (cacheSpy as jasmine.SpyObj<CacheService>).get.and.callFake(() => {
            const response: ReadOntology = MockOntology.mockReadOntology(
                'http://0.0.0.0:3333/ontology/0001/anything/v2'
            );
            return of(response);
        });

        fixture = TestBed.createComponent(TestHostResourceClassFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
