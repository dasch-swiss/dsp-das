import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FulltextSearchComponent } from './fulltext-search.component';

describe('FulltextSearchComponent', () => {
  let component: FulltextSearchComponent;
  let fixture: ComponentFixture<FulltextSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FulltextSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FulltextSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
