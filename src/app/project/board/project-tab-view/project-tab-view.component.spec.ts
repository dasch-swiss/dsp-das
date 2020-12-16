import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectTabViewComponent } from './project-tab-view.component';

describe('ProjectTabViewComponent', () => {
  let component: ProjectTabViewComponent;
  let fixture: ComponentFixture<ProjectTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
