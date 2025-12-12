import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PropertyFormLinkValueComponent } from './property-form-link-value.component';

describe('PropertyFormLinkValueComponent', () => {
  let component: PropertyFormLinkValueComponent;
  let fixture: ComponentFixture<PropertyFormLinkValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyFormLinkValueComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyFormLinkValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
