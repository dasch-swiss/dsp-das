import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceLinkFormComponent } from './resource-link-form.component';

describe('ResourceLinkFormComponent', () => {
  let component: ResourceLinkFormComponent;
  let fixture: ComponentFixture<ResourceLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceLinkFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
