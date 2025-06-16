import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DspResource } from '@dasch-swiss/vre/shared/app-common';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { PropertiesDisplayComponent } from './properties-display.component';

@Component({ selector: 'app-properties-toolbar', template: '' })
class MockPropertiesToolbarComponent {
  @Input() showToggleProperties: boolean = false;
  @Input() showOnlyIcons: boolean = false;
}

@Component({ selector: 'app-annotation-toolbar', template: '' })
class MockAnnotationToolbarComponent {
  @Input() resource: any;
  @Input() parentResourceId: string = '';
}

@Component({ selector: 'app-property-row', template: '' })
class MockPropertyRowComponent {
  @Input() isEmptyRow: boolean = false;
  @Input() borderBottom: boolean = false;
  @Input() tooltip: string = '';
  @Input() prop: any;
  @Input() singleRow: boolean = false;
  @Input() label: string = '';
}

@Component({ selector: 'app-existing-property-value', template: '' })
class MockExistingPropertyValueComponent {
  @Input() prop: any;
  @Input() resource: any;
}

@Component({ selector: 'app-standoff-links-property', template: '' })
class MockStandoffLinksPropertyComponent {
  @Input() resource: any;
}

@Component({ selector: 'app-incoming-links-property', template: '' })
class MockIncomingLinksPropertyComponent {
  @Input() resource: any;
}

describe('PropertiesDisplayComponent', () => {
  let component: PropertiesDisplayComponent;
  let fixture: ComponentFixture<PropertiesDisplayComponent>;
  let mockStore: any;

  beforeEach(async () => {
    mockStore = {
      select: jasmine.createSpy().and.returnValue(of({})),
    };

    await TestBed.configureTestingModule({
      declarations: [
        PropertiesDisplayComponent,
        MockPropertiesToolbarComponent,
        MockAnnotationToolbarComponent,
        MockPropertyRowComponent,
        MockExistingPropertyValueComponent,
        MockStandoffLinksPropertyComponent,
        MockIncomingLinksPropertyComponent,
      ],
      providers: [{ provide: Store, useValue: mockStore }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesDisplayComponent);
    component = fixture.componentInstance;
    component.resource = {
      res: {
        id: 'res1',
        label: 'Test Resource',
        creationDate: new Date().toISOString(),
        attachedToUser: 'user1',
      },
      resProps: [
        {
          propDef: { id: 'prop1', label: 'Property 1', isEditable: true, comment: '', guiDef: { cardinality: 1 } },
          values: [],
        },
      ],
    } as unknown as DspResource;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the resource label when displayLabel is true', () => {
    component.displayLabel = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Test Resource');
  });

  it('should show "no properties" message if no editable properties', () => {
    component.editableProperties = [];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('This resource has no defined properties.');
  });
});
