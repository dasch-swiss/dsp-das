import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { AppInitService, DspApiConfigToken, DspApiConnectionToken } from '@dasch-swiss/dsp-ui';
import { TestConfig } from 'test.config';

import { EditListItemComponent } from './edit-list-item.component';

describe('EditListItemComponent', () => {
    let component: EditListItemComponent;
    let fixture: ComponentFixture<EditListItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                EditListItemComponent
            ],
            imports: [
                BrowserAnimationsModule
            ],
            providers: [
                AppInitService,
                {
                    provide: DspApiConfigToken,
                    useValue: TestConfig.ApiConfig
                },
                {
                    provide: DspApiConnectionToken,
                    useValue: new KnoraApiConnection(TestConfig.ApiConfig)
                }
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EditListItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
