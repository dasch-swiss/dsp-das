import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DynamicFormsDataService } from '../../../../service/dynamic-forms-data.service';
import { LinkValueComponent } from './link-value.component';

describe('PropertyFormLinkValueComponent', () => {
  let component: LinkValueComponent;
  let fixture: ComponentFixture<LinkValueComponent>;
  let mockDataService: jest.Mocked<DynamicFormsDataService>;

  beforeEach(async () => {
    mockDataService = {
      searchResourcesByLabel$: jest.fn().mockReturnValue(of([])),
    } as any;

    await TestBed.configureTestingModule({
      imports: [LinkValueComponent, BrowserAnimationsModule],
      providers: [{ provide: DynamicFormsDataService, useValue: mockDataService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LinkValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
