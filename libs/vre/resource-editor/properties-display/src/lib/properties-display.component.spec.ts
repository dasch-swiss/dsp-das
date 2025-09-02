import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { PropertiesDisplayComponent } from '@dasch-swiss/vre/resource-editor/properties-display';
import mockResource from './mock-resource';

describe('PropertiesDisplay Integration Test (Simplified)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PropertiesDisplayComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
            },
          },
        },
      ],
    }).compileComponents();
  });

  it('should work with mock resource data', () => {
    const fixture = TestBed.createComponent(PropertiesDisplayComponent);
    const component = fixture.componentInstance;

    // Set the resource from our mock
    component.resource = mockResource;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.resource).toBe(mockResource);
  });
});
