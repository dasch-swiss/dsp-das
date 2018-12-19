import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FacetedSearchComponent } from './faceted-search.component';

describe('FacetedSearchComponent', () => {
  let component: FacetedSearchComponent;
  let fixture: ComponentFixture<FacetedSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FacetedSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FacetedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
