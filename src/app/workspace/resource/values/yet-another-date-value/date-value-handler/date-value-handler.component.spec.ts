import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateValueHandlerComponent } from './date-value-handler.component';

describe('DateValueHandlerComponent', () => {
  let component: DateValueHandlerComponent;
  let fixture: ComponentFixture<DateValueHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateValueHandlerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateValueHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
