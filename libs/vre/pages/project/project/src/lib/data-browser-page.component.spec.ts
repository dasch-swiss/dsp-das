import { BreakpointObserver } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DataBrowserPageComponent } from './data-browser-page.component';

/** A BreakpointObserver for a screen of the given width: `(min-width: Npx)` matches when width ≥ N. */
const observerFor = (screenWidth: number): Partial<BreakpointObserver> => ({
  isMatched: (query: string | readonly string[]) =>
    [query].flat().every(single => screenWidth >= Number(/min-width:\s*(\d+)px/.exec(single)?.[1])),
  observe: () => of({ matches: true, breakpoints: {} }),
});

const sidebarWidthAt = (screenWidth: number): number => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: observerFor(screenWidth) }] });
  return TestBed.runInInjectionContext(() => new DataBrowserPageComponent()).sidebarWidth();
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
    ])('on a %ipx screen it is %ipx wide', (screenWidth, expected) => {
      expect(sidebarWidthAt(screenWidth)).toBe(expected);
    });
  });
});
