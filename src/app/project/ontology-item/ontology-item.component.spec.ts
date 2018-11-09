import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyItemComponent } from './ontology-item.component';

describe('OntologyItemComponent', () => {
  let component: OntologyItemComponent;
  let fixture: ComponentFixture<OntologyItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
