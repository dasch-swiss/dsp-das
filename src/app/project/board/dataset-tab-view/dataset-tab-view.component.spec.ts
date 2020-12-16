import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetTabViewComponent } from './dataset-tab-view.component';

describe('DatasetTabViewComponent', () => {
  let component: DatasetTabViewComponent;
  let fixture: ComponentFixture<DatasetTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
