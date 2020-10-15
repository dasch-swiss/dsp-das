import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceInstanceFormComponent } from './resource-instance-form.component';

describe('ResourceInstanceFormComponent', () => {
  let component: ResourceInstanceFormComponent;
  let fixture: ComponentFixture<ResourceInstanceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceInstanceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceInstanceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
