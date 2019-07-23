import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntologyFormComponent } from './ontology-form.component';

describe('OntologyFormComponent', () => {
  let component: OntologyFormComponent;
  let fixture: ComponentFixture<OntologyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntologyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntologyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
