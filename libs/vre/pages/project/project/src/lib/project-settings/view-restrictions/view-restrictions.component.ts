import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import {
  GroupBy,
  ItemType,
  PagedResponseRestrictedResource,
  RestrictedItem,
  RestrictedResource,
  RestrictionGroup,
  Visibility,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { ResourceService } from '@dasch-swiss/vre/shared/app-common';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { PagerComponent } from '@dasch-swiss/vre/ui/ui';
import { TranslatePipe } from '@ngx-translate/core';
import { take, tap } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';
import { ViewRestrictionsPageService } from './view-restrictions-page.service';
import { VisibilityCellComponent } from './visibility-cell.component';

interface ExpandedGroup {
  page: PagedResponseRestrictedResource;
  currentPage: number;
}

/**
 * Translation-key slugs for the API enums. Decoupled from the enum *values* on purpose: the
 * generated client currently emits PascalCase (`ItemType.All === 'All'`), and using those verbatim
 * as i18n keys would silently fall back to the raw key if the API ever changes its casing.
 */
const ITEM_TYPE_SLUG: Record<ItemType, string> = {
  All: 'all',
  Resource: 'resource',
  File: 'file',
  Value: 'value',
  Comment: 'comment',
};

/**
 * Read-only "View restrictions" page (design screen 1h): a per-audience matrix of hidden items,
 * grouped by resource class or property, with an expandable drill-down of affected resources/items.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-restrictions',
  templateUrl: './view-restrictions.component.html',
  styleUrl: './view-restrictions.component.scss',
  providers: [ViewRestrictionsPageService],
  imports: [
    AsyncPipe,
    TranslatePipe,
    MatIcon,
    MatButtonToggleModule,
    MatChipsModule,
    AppProgressIndicatorComponent,
    PagerComponent,
    VisibilityCellComponent,
  ],
})
export class ViewRestrictionsComponent {
  // expose enums to the template
  readonly GroupBy = GroupBy;
  readonly ItemType = ItemType;

  readonly itemTypeChips: ItemType[] = [
    ItemType.All,
    ItemType.Resource,
    ItemType.File,
    ItemType.Value,
    ItemType.Comment,
  ];

  readonly summaryState$ = this.vr.summaryState$;
  readonly groupBy$ = this.vr.groupBy$;
  readonly itemType$ = this.vr.itemType$;

  /** Per-group expansion state, keyed by group id. A signal so OnPush re-renders when it changes. */
  readonly expanded = signal<Record<string, ExpandedGroup | 'loading'>>({});

  /** Drill-down page size; also fed to `app-pager` so it can compute the page count. */
  readonly pageSize = 25;

  readonly project$ = this._projectPageService.currentProject$.pipe(
    tap(project => this.titleService.setTitle(`Project ${project.shortname} | View restrictions`))
  );

  constructor(
    protected titleService: Title,
    public vr: ViewRestrictionsPageService,
    private readonly _projectPageService: ProjectPageService,
    private readonly _resourceService: ResourceService
  ) {}

  /** In-app path to open a resource: `/resource/{shortcode}/{uuid}` (getResourcePath strips the iriBase). */
  resourceLink(resourceIri: string): string {
    return `/resource${this._resourceService.getResourcePath(resourceIri)}`;
  }

  /**
   * Path to open a restricted item: the containing resource, deep-linked to the specific value via
   * `?highlightValue={valueUuid}` (the value UUID is the last segment of the value IRI). Falls back to
   * the resource link when there is no value IRI.
   */
  itemLink(resourceIri: string, valueIri: string | undefined): string {
    const base = this.resourceLink(resourceIri);
    const valueUuid = valueIri?.split('/').filter(Boolean).pop();
    return valueUuid ? `${base}?highlightValue=${encodeURIComponent(valueUuid)}` : base;
  }

  onGroupBy(value: GroupBy): void {
    this.expanded.set({});
    this.vr.setGroupBy(value);
  }

  onItemType(value: ItemType): void {
    this.expanded.set({});
    this.vr.setItemType(value);
  }

  /** In property mode the "Resource" filter is not meaningful (whole-resource rows are out of scope). */
  isChipDisabled(chip: ItemType): boolean {
    return chip === ItemType.Resource && this.groupBy$.value === GroupBy.Property;
  }

  toggleGroup(group: RestrictionGroup): void {
    if (this.expanded()[group.id]) {
      const next = { ...this.expanded() };
      delete next[group.id];
      this.expanded.set(next);
      return;
    }
    this.loadPage(group.id, 1);
  }

  loadPage(groupId: string, page: number): void {
    this.expanded.update(e => ({ ...e, [groupId]: 'loading' }));
    this.vr
      .loadItems(groupId, page, this.pageSize)
      .pipe(take(1))
      .subscribe(result => {
        this.expanded.update(e => ({ ...e, [groupId]: { page: result, currentPage: page } }));
      });
  }

  /**
   * Bridge from `app-pager`'s 0-based `pageIndexChanged` to this API's 1-based paging.
   *
   * The pager emits on every index assignment — including the reset to 0 its own `ngOnChanges`
   * performs when `numberOfAllResults` changes — so ignore an event that names the page already
   * displayed, otherwise expanding a group would immediately refetch page 1.
   */
  onPageIndexChanged(groupId: string, pageIndex: number): void {
    const page = pageIndex + 1;
    if (this.expandedGroup(groupId)?.currentPage === page) {
      return;
    }
    this.loadPage(groupId, page);
  }

  isExpanded(id: string): boolean {
    return !!this.expanded()[id];
  }

  isLoading(id: string): boolean {
    return this.expanded()[id] === 'loading';
  }

  expandedGroup(id: string): ExpandedGroup | null {
    const e = this.expanded()[id];
    return e && e !== 'loading' ? e : null;
  }

  private isResourceVisible(res: RestrictedResource): boolean {
    const v = res.resourceVisibility;
    return (
      v.anonymous === Visibility.Visible &&
      v.authenticated === Visibility.Visible &&
      v.projectMember === Visibility.Visible
    );
  }

  /**
   * A resource collapses onto one line (design 1g/1h combo row) when it is itself fully visible and
   * carries exactly one restricted item — the resource + its single item render inline.
   */
  isCombo(res: RestrictedResource): boolean {
    return this.isResourceVisible(res) && (res.items?.length ?? 0) === 1;
  }

  itemIcon(item: RestrictedItem): string {
    return item.type === ItemType.File ? 'image' : item.type === ItemType.Comment ? 'comment' : 'lock';
  }

  /** Translation key for an item-type label (chips and per-row tags). */
  itemTypeKey(type: ItemType): string {
    return `pages.project.viewRestrictions.itemType.${ITEM_TYPE_SLUG[type] ?? 'all'}`;
  }
}
