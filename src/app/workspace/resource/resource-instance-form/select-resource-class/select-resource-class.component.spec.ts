import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectResourceClassComponent } from './select-resource-class.component';

describe('SelectResourceClassComponent', () => {
  let component: SelectResourceClassComponent;
  let fixture: ComponentFixture<SelectResourceClassComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectResourceClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectResourceClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
