import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { KuiCoreConfig, KuiCoreConfigToken, KuiCoreModule } from '@knora/core';
import { KuiViewerModule } from '@knora/viewer';

import { ResultsComponent } from './results.component';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultsComponent ],
      imports: [
        KuiCoreModule,
        KuiViewerModule,
        RouterTestingModule
      ],
      providers: [
          {
              provide: KuiCoreConfigToken,
              useValue: KuiCoreConfig
          }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
