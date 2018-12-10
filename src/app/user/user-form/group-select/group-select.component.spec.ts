import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupSelectComponent } from './group-select.component';

describe('GroupSelectComponent', () => {
  let component: GroupSelectComponent;
  let fixture: ComponentFixture<GroupSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
