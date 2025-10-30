import { ProgressIndicatorOverlayComponent } from './lib/app-progress-indicator/progress-indicator-overlay.component';
import { ProgressSpinnerComponent } from './lib/app-progress-indicator/progress-spinner.component';
import { LoadingButtonDirective } from './lib/loading-button/loading-button.directive';

/**
 * @deprecated All components are now standalone. Import them directly instead.
 * This array is kept for backward compatibility but will be removed in a future version.
 */
export const ProgressIndicatorComponents = [
  LoadingButtonDirective,
  ProgressIndicatorOverlayComponent,
  ProgressSpinnerComponent,
];
