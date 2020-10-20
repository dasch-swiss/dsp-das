import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPropertiesComponent } from './select-properties.component';

describe('SelectPropertiesComponent', () => {
  let component: SelectPropertiesComponent;
  let fixture: ComponentFixture<SelectPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
