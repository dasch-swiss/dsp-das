import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OntologyResourceFormComponent } from './ontology-resource-form.component';

describe('OntologyResourceFormComponent', () => {
  let component: OntologyResourceFormComponent;
  let fixture: ComponentFixture<OntologyResourceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OntologyResourceFormComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(OntologyResourceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
