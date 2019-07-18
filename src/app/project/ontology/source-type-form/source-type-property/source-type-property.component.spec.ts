import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceTypePropertyComponent } from './source-type-property.component';

describe('SourceTypePropertyComponent', () => {
  let component: SourceTypePropertyComponent;
  let fixture: ComponentFixture<SourceTypePropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceTypePropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceTypePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
