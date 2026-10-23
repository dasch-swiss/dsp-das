import { inject, InjectionToken } from '@angular/core';
import { UserService } from '@dasch-swiss/vre/core/session';
import { Observable } from 'rxjs';

/**
 * How a value's hover actions present themselves, for hosts that show values more densely than
 * the resource viewer does. The defaults are the viewer's own.
 */
export interface ValueActionsOptions {
  /**
   * Whether a value the user cannot edit offers an info button with who created it and when. Off
   * by default for visitors who are not logged in, where a button on every hovered value only to
   * show a creation date is noise (DEV-7494).
   */
  showInfo$: Observable<boolean>;
  /** Whether the Edit button's tooltip also says who created the value and when. */
  creationInfoInEditTooltip: boolean;
}

export const VALUE_ACTIONS_OPTIONS = new InjectionToken<ValueActionsOptions>('VALUE_ACTIONS_OPTIONS', {
  factory: () => ({ showInfo$: inject(UserService).isLoggedIn$, creationInfoInEditTooltip: true }),
});
