import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VreSharedFootnotesComponent } from './vre-shared-footnotes.component';

describe('VreSharedFootnotesComponent', () => {
  let component: VreSharedFootnotesComponent;
  let fixture: ComponentFixture<VreSharedFootnotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VreSharedFootnotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VreSharedFootnotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
