import { CreateSegmentDialogComponent } from './lib/create-segment-dialog.component';
import { CustomTooltipDirective } from './lib/custom-tooltip.directive';
import { SegmentTooltipComponent } from './lib/segment-tooltip.component';
import { SegmentComponent } from './lib/segment.component';
import { SegmentsDisplayComponent } from './lib/segments-display.component';

/**
 * All segment support components are now standalone.
 * This array is exported for backwards compatibility.
 * Import these components directly in your standalone components or in the imports array of your modules.
 */
export const SegmentSupportComponents = [
  CreateSegmentDialogComponent,
  SegmentComponent,
  SegmentsDisplayComponent,
  CustomTooltipDirective,
  SegmentTooltipComponent,
] as const;
