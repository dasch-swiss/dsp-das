import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelsComponent } from './data-models.component';

describe('DataModelsComponent', () => {
  let component: DataModelsComponent;
  let fixture: ComponentFixture<DataModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataModelsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
