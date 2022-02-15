import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkResourceResultsComponent } from './link-resource-results.component';

describe('LinkResourceResultsComponent', () => {
  let component: LinkResourceResultsComponent;
  let fixture: ComponentFixture<LinkResourceResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LinkResourceResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkResourceResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
