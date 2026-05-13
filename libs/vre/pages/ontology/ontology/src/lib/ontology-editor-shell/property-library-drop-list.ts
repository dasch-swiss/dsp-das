/**
 * Static id for the property-library `cdkDropList`.
 *
 * Shared between the property library (the drag source) and the class
 * workspace cards (the drop targets) so that workspace `<cdkDropList>`
 * elements can declare `cdkDropListConnectedTo` symbolically without
 * needing a `@ViewChild` reference back into the library pane.
 *
 * Kept in the shell directory so both panes import it without forming
 * a sibling-to-sibling dependency.
 */
export const PROPERTY_LIBRARY_DROP_LIST_ID = 'property-library';
