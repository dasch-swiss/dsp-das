import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GravsearchComponent } from './gravsearch.component';

describe('GravsearchComponent', () => {
  let component: GravsearchComponent;
  let fixture: ComponentFixture<GravsearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GravsearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GravsearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
