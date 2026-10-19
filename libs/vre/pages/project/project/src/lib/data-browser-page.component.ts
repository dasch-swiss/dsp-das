import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { MultipleViewerService } from '@dasch-swiss/vre/pages/data-browser';
import { ResourceResultService } from '@dasch-swiss/vre/shared/app-helper-services';
import { AngularSplitModule } from 'angular-split';
import { map } from 'rxjs';
import { DataBrowserPageService } from './data-browser-page.service';
import { ProjectSidenavComponent } from './sidenav/project-sidenav.component';

/**
 * The sidebar's default width from each breakpoint up, widest first. The min-widths are the md–xxl
 * tokens of `apps/dsp-app/src/styles/_responsive.scss` (DEV-7494).
 */
export const SIDEBAR_WIDTHS: readonly (readonly [minWidth: number, width: number])[] = [
  [2560, 360],
  [1920, 320],
  [1536, 280],
  [1280, 220],
];

/** Below the md breakpoint (1280). */
export const SIDEBAR_WIDTH_BELOW_MD = 170;

const QUERIES = SIDEBAR_WIDTHS.map(([minWidth]) => `(min-width: ${minWidth}px)`);

/**
 * Container component for the data browser page with split layout.
 * Provides scoped service instances (MultipleViewerService, ResourceResultService, DataBrowserPageService)
 * that are shared across child components within this page.
 */
@Component({
  selector: 'app-data-browser-page',
  template: `<div style="display: flex; flex-direction: column; height: 100%">
    <!-- The sidebar's width follows the screen's breakpoint, narrow enough that the classes do not
         take the width the data needs; still resizable from its gutter (DEV-7494). -->
    <as-split direction="horizontal" unit="pixel">
      <as-split-area [size]="sidebarWidth()" [minSize]="160" [maxSize]="480">
        <app-project-sidenav />
      </as-split-area>
      <as-split-area size="*">
        <router-outlet />
      </as-split-area>
    </as-split>
  </div> `,
  providers: [MultipleViewerService, ResourceResultService, DataBrowserPageService],
  imports: [RouterOutlet, AngularSplitModule, ProjectSidenavComponent],
})
export class DataBrowserPageComponent {
  private readonly _breakpoints = inject(BreakpointObserver);

  /**
   * The width for the widest breakpoint the screen reaches. A width the user dragged to stays until
   * the screen crosses into another breakpoint, which puts that breakpoint's width back.
   */
  readonly sidebarWidth = toSignal(this._breakpoints.observe(QUERIES).pipe(map(() => this._widthForScreen())), {
    initialValue: this._widthForScreen(),
  });

  private _widthForScreen(): number {
    const match = SIDEBAR_WIDTHS.find((_, index) => this._breakpoints.isMatched(QUERIES[index]));
    return match ? match[1] : SIDEBAR_WIDTH_BELOW_MD;
  }
}
