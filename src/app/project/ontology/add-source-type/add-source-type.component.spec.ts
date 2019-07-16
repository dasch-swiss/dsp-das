import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSourceTypeComponent } from './add-source-type.component';

describe('AddSourceTypeComponent', () => {
  let component: AddSourceTypeComponent;
  let fixture: ComponentFixture<AddSourceTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSourceTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSourceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
