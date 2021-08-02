import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntermediateComponent } from './intermediate.component';

describe('IntermediateComponent', () => {
  let component: IntermediateComponent;
  let fixture: ComponentFixture<IntermediateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntermediateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntermediateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
