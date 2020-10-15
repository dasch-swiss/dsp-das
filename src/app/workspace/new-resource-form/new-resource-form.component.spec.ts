import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewResourceFormComponent } from './new-resource-form.component';

describe('NewResourceFormComponent', () => {
  let component: NewResourceFormComponent;
  let fixture: ComponentFixture<NewResourceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewResourceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewResourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
