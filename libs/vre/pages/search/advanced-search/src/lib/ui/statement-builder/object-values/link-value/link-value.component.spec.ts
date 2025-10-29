import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LinkValueComponent } from './link-value.component';

describe('PropertyFormLinkValueComponent', () => {
  let component: LinkValueComponent;
  let fixture: ComponentFixture<LinkValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkValueComponent, BrowserAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
