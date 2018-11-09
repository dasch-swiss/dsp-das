import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyListComponent } from './ontology-list.component';

describe('OntologyListComponent', () => {
  let component: OntologyListComponent;
  let fixture: ComponentFixture<OntologyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
