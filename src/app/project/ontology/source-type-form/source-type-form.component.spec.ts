import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceTypeFormComponent } from './source-type-form.component';

describe('SourceTypeFormComponent', () => {
  let component: SourceTypeFormComponent;
  let fixture: ComponentFixture<SourceTypeFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceTypeFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
