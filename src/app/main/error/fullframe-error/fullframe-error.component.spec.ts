import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullframeErrorComponent } from './fullframe-error.component';

describe('FullframeErrorComponent', () => {
  let component: FullframeErrorComponent;
  let fixture: ComponentFixture<FullframeErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullframeErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullframeErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
