import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StringValueComponent } from './string-value.component';

describe('PropertyFormValueComponent', () => {
  let component: StringValueComponent;
  let fixture: ComponentFixture<StringValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StringValueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StringValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
