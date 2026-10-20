import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { OntologyService } from '@dasch-swiss/vre/shared/app-helper-services';
import { BehaviorSubject, NEVER } from 'rxjs';
import { DataClassViewComponent } from './data-class-view.component';
import { ProjectPageService } from './project-page.service';

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

const viewIn = (window: ReturnType<typeof windowOf>): DataClassViewComponent => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [{ provide: BreakpointObserver, useValue: window.observer }] });
  const projectPageService = { currentProject$: NEVER, ontologies$: NEVER } as unknown as ProjectPageService;
  const route = { params: NEVER } as unknown as ActivatedRoute;
  return TestBed.runInInjectionContext(
    () => new DataClassViewComponent(projectPageService, route, {} as OntologyService)
  );
};

describe('DataClassViewComponent', () => {
  describe('result list width per breakpoint', () => {
    it.each([
      [767, 340],
      [1279, 340],
      [1280, 440],
      [1535, 440],
      [1536, 560],
      [1919, 560],
      [1920, 640],
      [2559, 640],
      [2560, 720],
      [3840, 720],
    ])('on a %ipx window it is %ipx wide', (windowWidth, expected) => {
      expect(viewIn(windowOf(windowWidth)).resultListWidth()).toBe(expected);
    });

    it('follows the window across breakpoints until the user drags it', () => {
      const window = windowOf(1600);
      const view = viewIn(window);

      window.resizeTo(2000);
      expect(view.resultListWidth()).toBe(640);

      view.onResultListDragged({ gutterNum: 1, sizes: [812, '*'] });
      expect(view.resultListWidth()).toBe(812);

      // Resizing the window no longer changes it, whichever breakpoint it lands in.
      window.resizeTo(1300);
      expect(view.resultListWidth()).toBe(812);
      window.resizeTo(2600);
      expect(view.resultListWidth()).toBe(812);
    });
  });
});
