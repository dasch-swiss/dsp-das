import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsTabViewComponent } from './terms-tab-view.component';

describe('TermsTabViewComponent', () => {
  let component: TermsTabViewComponent;
  let fixture: ComponentFixture<TermsTabViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermsTabViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsTabViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
