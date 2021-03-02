import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceClassInfoComponent } from './resource-class-info.component';

fdescribe('ResourceClassInfoComponent', () => {
  let component: ResourceClassInfoComponent;
  let fixture: ComponentFixture<ResourceClassInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceClassInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceClassInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
