import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectOntologyComponent } from './select-ontology.component';

describe('SelectOntologyComponent', () => {
  let component: SelectOntologyComponent;
  let fixture: ComponentFixture<SelectOntologyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectOntologyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectOntologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
