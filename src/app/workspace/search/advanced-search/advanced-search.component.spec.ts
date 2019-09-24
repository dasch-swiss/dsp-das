import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionModule } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiCoreConfig, KuiCoreConfigToken } from '@knora/core';
import { KuiSearchModule } from '@knora/search';
import { KuiViewerModule } from '@knora/viewer';

import { AdvancedSearchComponent } from './advanced-search.component';

describe('AdvancedSearchComponent', () => {
    let component: AdvancedSearchComponent;
    let fixture: ComponentFixture<AdvancedSearchComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AdvancedSearchComponent],
            imports: [
                HttpClientTestingModule,
                KuiSearchModule,
                KuiViewerModule,
                MatExpansionModule,
                RouterTestingModule
            ],
            providers: [
                {
                    provide: ActivatedRoute
                },
                {
                    provide: KuiCoreConfigToken,
                    useValue: KuiCoreConfig
                }
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AdvancedSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
