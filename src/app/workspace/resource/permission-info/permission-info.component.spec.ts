import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionInfoComponent } from './permission-info.component';

describe('PermissionInfoComponent', () => {
  let component: PermissionInfoComponent;
  let fixture: ComponentFixture<PermissionInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PermissionInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
