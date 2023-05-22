import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchNewComponent } from './advanced-search-new.component';

describe('AdvancedSearchNewComponent', () => {
  let component: AdvancedSearchNewComponent;
  let fixture: ComponentFixture<AdvancedSearchNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdvancedSearchNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSearchNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
