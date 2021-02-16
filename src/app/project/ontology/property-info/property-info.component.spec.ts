import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyInfoComponent } from './property-info.component';

describe('PropertyInfoComponent', () => {
  let component: PropertyInfoComponent;
  let fixture: ComponentFixture<PropertyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PropertyInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
