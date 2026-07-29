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
  RestrictionGroup,
  Visibility,
} from '@dasch-swiss/vre/3rd-party-services/open-api';
import { AppProgressIndicatorComponent } from '@dasch-swiss/vre/ui/progress-indicator';
import { TranslatePipe } from '@ngx-translate/core';
import { take, tap } from 'rxjs';
import { ProjectPageService } from '../../project-page.service';
import { ViewRestrictionsPageService } from './view-restrictions-page.service';

interface ExpandedGroup {
  page: PagedResponseRestrictedResource;
  currentPage: number;
}

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
  imports: [AsyncPipe, TranslatePipe, MatIcon, MatButtonToggleModule, MatChipsModule, AppProgressIndicatorComponent],
})
export class ViewRestrictionsComponent {
  // expose enums to the template
  readonly GroupBy = GroupBy;
  readonly ItemType = ItemType;
  readonly Visibility = Visibility;

  readonly itemTypeChips: ItemType[] = [
    ItemType.All,
    ItemType.Resource,
    ItemType.File,
    ItemType.Value,
    ItemType.Comment,
  ];

  readonly summary$ = this.vr.summary$;
  readonly groupBy$ = this.vr.groupBy$;
  readonly itemType$ = this.vr.itemType$;

  /** Per-group expansion state, keyed by group id. A signal so OnPush re-renders when it changes. */
  readonly expanded = signal<Record<string, ExpandedGroup | 'loading'>>({});

  private readonly _pageSize = 25;

  readonly project$ = this._projectPageService.currentProject$.pipe(
    tap(project => this.titleService.setTitle(`Project ${project.shortname} | View restrictions`))
  );

  constructor(
    protected titleService: Title,
    public vr: ViewRestrictionsPageService,
    private readonly _projectPageService: ProjectPageService
  ) {}

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
      .loadItems(groupId, page, this._pageSize)
      .pipe(take(1))
      .subscribe(result => {
        this.expanded.update(e => ({ ...e, [groupId]: { page: result, currentPage: page } }));
      });
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

  /** Total hidden across the three audiences for a group (drives the "no restrictions" empty case). */
  isEmptyGroup(group: RestrictionGroup): boolean {
    const c = group.counts;
    return c.anonymous + c.authenticated + c.projectMember === 0;
  }

  visibilityIcon(v: Visibility | undefined): string {
    switch (v) {
      case Visibility.Hidden:
        return 'visibility_off';
      case Visibility.RestrictedView:
        return 'blur_on';
      default:
        return 'visibility';
    }
  }

  visibilityClass(v: Visibility | undefined): string {
    switch (v) {
      case Visibility.Hidden:
        return 'vis-hidden';
      case Visibility.RestrictedView:
        return 'vis-restricted';
      default:
        return 'vis-visible';
    }
  }
}
