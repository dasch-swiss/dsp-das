import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AdminAPIApiService,
  GroupBy,
  ItemType,
  PagedResponseRestrictedResource,
  ViewRestrictionsSummary,
  Visibility,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';
import { ViewRestrictionsComponent } from './view-restrictions.component';

const summary: ViewRestrictionsSummary = {
  projectIri: 'http://rdfh.ch/projects/0001',
  groupBy: GroupBy.ResourceClass,
  itemType: ItemType.All,
  groups: [
    {
      id: 'http://www.knora.org/ontology/0001/anything#Thing',
      label: 'Thing',
      ontology: 'anything',
      counts: { anonymous: 15, authenticated: 14, projectMember: 5 },
    },
  ],
  totals: { anonymous: 15, authenticated: 14, projectMember: 5 },
  approximate: false,
};

const itemsPage: PagedResponseRestrictedResource = {
  data: [
    {
      resourceIri: 'http://rdfh.ch/0001/a-thing',
      label: 'A thing',
      resourceClassIri: 'http://www.knora.org/ontology/0001/anything#Thing',
      resourceVisibility: {
        anonymous: Visibility.Hidden,
        authenticated: Visibility.Visible,
        projectMember: Visibility.Visible,
      },
      items: [],
    },
  ],
  pagination: { pageSize: 25, totalItems: 1, totalPages: 1, currentPage: 1 },
};

describe('ViewRestrictionsComponent', () => {
  let fixture: ComponentFixture<ViewRestrictionsComponent>;
  let component: ViewRestrictionsComponent;

  const adminApiMock = {
    getAdminProjectsIriProjectiriViewRestrictionsSummary: jest.fn().mockReturnValue(of(summary)),
    getAdminProjectsIriProjectiriViewRestrictionsItems: jest.fn().mockReturnValue(of(itemsPage)),
  };

  const projectPageServiceMock = {
    currentProject$: of({ id: 'http://rdfh.ch/projects/0001', shortname: 'anything', shortcode: '0001' }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRestrictionsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AdminAPIApiService, useValue: adminApiMock },
        { provide: ProjectPageService, useValue: projectPageServiceMock },
        provideTranslateService(),
        TranslateService,
      ],
    })
      .overrideComponent(ViewRestrictionsComponent, { set: { template: '<div>Mock Template</div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(ViewRestrictionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => jest.clearAllMocks());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the summary for the current project', done => {
    component.summary$.subscribe(s => {
      expect(s.groups?.length).toBe(1);
      expect(s.totals.anonymous).toBe(15);
      done();
    });
  });

  it('expands a group and stores the fetched items (resolves the loading state)', () => {
    const group = summary.groups![0];
    component.toggleGroup(group);
    expect(adminApiMock.getAdminProjectsIriProjectiriViewRestrictionsItems).toHaveBeenCalledWith(
      'http://rdfh.ch/projects/0001',
      group.id,
      GroupBy.ResourceClass,
      ItemType.All,
      1,
      25
    );
    // 'of(...)' resolves synchronously, so loading must have advanced to the loaded state
    expect(component.isLoading(group.id)).toBe(false);
    expect(component.isExpanded(group.id)).toBe(true);
    expect(component.expandedGroup(group.id)?.page.data.length).toBe(1);
  });

  it('collapses an expanded group on second toggle', () => {
    const group = summary.groups![0];
    component.toggleGroup(group);
    component.toggleGroup(group);
    expect(component.isExpanded(group.id)).toBe(false);
  });

  it('resets expansion and updates the filter when the item type changes', () => {
    const group = summary.groups![0];
    component.toggleGroup(group);
    component.onItemType(ItemType.Value);
    expect(component.isExpanded(group.id)).toBe(false);
    expect(component.vr.itemType$.value).toBe(ItemType.Value);
  });

  it('disables the Resource chip in property mode', () => {
    component.onGroupBy(GroupBy.Property);
    expect(component.isChipDisabled(ItemType.Resource)).toBe(true);
    expect(component.isChipDisabled(ItemType.Value)).toBe(false);
  });

  it('maps visibility to the correct icon', () => {
    expect(component.visibilityIcon(Visibility.Hidden)).toBe('visibility_off');
    expect(component.visibilityIcon(Visibility.RestrictedView)).toBe('blur_on');
    expect(component.visibilityIcon(Visibility.Visible)).toBe('visibility');
  });

  describe('isCombo (single-item resources render on one line)', () => {
    const visible = { anonymous: Visibility.Visible, authenticated: Visibility.Visible, projectMember: Visibility.Visible };
    const item = {
      type: ItemType.Value,
      visibility: { anonymous: Visibility.Hidden, authenticated: Visibility.Hidden, projectMember: Visibility.Visible },
    };

    it('is a combo when the resource is fully visible and has exactly one item', () => {
      expect(
        component.isCombo({ resourceIri: 'r', label: 'R', resourceClassIri: 'c', resourceVisibility: visible, items: [item] })
      ).toBe(true);
    });

    it('is NOT a combo when the resource has more than one item', () => {
      expect(
        component.isCombo({
          resourceIri: 'r',
          label: 'R',
          resourceClassIri: 'c',
          resourceVisibility: visible,
          items: [item, item],
        })
      ).toBe(false);
    });

    it('is NOT a combo when the resource itself is restricted', () => {
      const restricted = { ...visible, anonymous: Visibility.Hidden };
      expect(
        component.isCombo({ resourceIri: 'r', label: 'R', resourceClassIri: 'c', resourceVisibility: restricted, items: [item] })
      ).toBe(false);
    });

    it('is NOT a combo when the resource has no items (whole-resource restriction)', () => {
      expect(
        component.isCombo({ resourceIri: 'r', label: 'R', resourceClassIri: 'c', resourceVisibility: visible, items: [] })
      ).toBe(false);
    });
  });
});
