import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchPropertiesComponent } from './switch-properties.component';

describe('SwitchPropertiesComponent', () => {
  let component: SwitchPropertiesComponent;
  let fixture: ComponentFixture<SwitchPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SwitchPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SwitchPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
