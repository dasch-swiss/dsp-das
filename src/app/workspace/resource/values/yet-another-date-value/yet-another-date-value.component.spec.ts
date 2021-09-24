import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YetAnotherDateValueComponent } from './yet-another-date-value.component';

describe('YetAnotherDateValueComponent', () => {
  let component: YetAnotherDateValueComponent;
  let fixture: ComponentFixture<YetAnotherDateValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YetAnotherDateValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YetAnotherDateValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
