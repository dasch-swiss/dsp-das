import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, takeUntil } from 'rxjs/operators';

/**
 * Wrapper for angular router-outlet. Does the very same as router-outlet except
 * all routed content is displayed in a drawer.
 * Usage: Simply wrap your main content by this component. The wrapped content
 * will be projected in the mat-drawer-container via ng-content, whereas the routed
 * content (child routes) will be rendered within the drawer.
 */
@Component({
  selector: 'router-outlet-drawer',
  templateUrl: './router-outlet-drawer.component.html',
  styleUrls: ['./router-outlet-drawer.component.scss'],
})
export class RouterOutletDrawerComponent implements OnDestroy {
  drawerOpenState = new BehaviorSubject<boolean>(false); // whether the drawer is open or not
  private _hasActiveChildRoute$: Observable<boolean>; // whether the current route has children
  private _destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    // open the drawer if the current route has children
    if (this._route.snapshot.children.length > 0) {
      this.drawerOpenState.next(true);
    }

    // Whether the current route has any child route or not
    this._hasActiveChildRoute$ = this._router.events.pipe(
      // listen to route changes and return whether the current route has children
      filter(event => this.concernsCurrentRoute(event)),
      // check if the event's snapshot has any children
      map(event => (event as ActivationEnd).snapshot.children.length > 0),
      distinctUntilChanged(),
      takeUntil(this._destroy$)
    );

    // When a child route is active, the drawer opens and displays that
    // route's component. If there are no children to display acc.
    // to the routes, the drawer closes.
    this._hasActiveChildRoute$.subscribe(isActive => {
      this.drawerOpenState.next(isActive);
    });
  }

  /**
   *  if the event is of concern of the current route/component. Only
   *  ActivationsEnd which are of the current route are of concern.
   */
  private concernsCurrentRoute(event: unknown): boolean {
    return (
      event instanceof ActivationEnd &&
      (event as ActivationEnd).snapshot.url[0].path === this._route.snapshot.url[0].path
    );
  }

  /**
   * close the drawer by navigating to the current route (i.e. the parent
   * components route). Removes any children/child routes and
   * params from the route.
   */
  closeDrawer() {
    this._router.navigate(['.'], {
      relativeTo: this._route,
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    this.drawerOpenState.complete();
  }
}
