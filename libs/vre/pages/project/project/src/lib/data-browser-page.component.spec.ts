import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { DataBrowserPageComponent } from './data-browser-page.component';

/**
 * A window whose width can change: `(min-width: Npx)` matches when its width ≥ N, and `observe`
 * emits on every change, as the real BreakpointObserver does when a query flips.
 */
const windowOf = (initialWidth: number) => {
  let width = initialWidth;
  const changes = new BehaviorSubject<BreakpointState>({ matches: true, breakpoints: {} });
  const observer: Partial<BreakpointObserver> = {
    isMatched: (query: string | readonly string[]) =>
      [query].flat().every(single => width >= Number(/min-width:\s*(\d+)px/.exec(single)?.[1])),
    observe: () => changes.asObservable(),
  };
  return {
    observer,
    resizeTo: (newWidth: number) => {
      width = newWidth;
      changes.next({ matches: true, breakpoints: {} });
    },
  };
};

const pageIn = (window: ReturnType<typeof windowOf>): DataBrowserPageComponent => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: window.observer }] });
  return TestBed.runInInjectionContext(() => new DataBrowserPageComponent());
};

describe('DataBrowserPageComponent', () => {
  describe('sidebar width per breakpoint', () => {
    it.each([
      [767, 170],
      [1279, 170],
      [1280, 220],
      [1535, 220],
      [1536, 280],
      [1919, 280],
      [1920, 320],
      [2559, 320],
      [2560, 360],
      [3840, 360],
    ])('on a %ipx window it is %ipx wide', (windowWidth, expected) => {
      expect(pageIn(windowOf(windowWidth)).sidebarWidth()).toBe(expected);
    });

    it('follows the window across breakpoints until the user drags it', () => {
      const window = windowOf(1600);
      const page = pageIn(window);

      window.resizeTo(2000);
      expect(page.sidebarWidth()).toBe(320);

      page.onSidebarDragged({ gutterNum: 1, sizes: [412, '*'] });
      expect(page.sidebarWidth()).toBe(412);

      // Resizing the window no longer changes it, whichever breakpoint it lands in.
      window.resizeTo(1300);
      expect(page.sidebarWidth()).toBe(412);
      window.resizeTo(2600);
      expect(page.sidebarWidth()).toBe(412);
    });
  });
});
