# Resource Editor Translation Migration Guide

## Overview

This document provides a complete guide for migrating all `libs/vre/resource-editor` components to use the new translation keys that have been added to the translation files.

**Status:** Translation keys are 100% complete in all 5 language files. Component updates are ~3% complete.

## Translation Keys Available

All keys are under `resourceEditor.*` in the translation files. See `apps/dsp-app/src/assets/i18n/en.json` lines 519-755 for the complete structure.

### Key Sections:
- `resourceEditor.toolbar.*` - Resource toolbar actions
- `resourceEditor.moreMenu.*` - More menu options
- `resourceEditor.infoBar.*` - Info bar labels
- `resourceEditor.legal.*` - Copyright/authorship
- `resourceEditor.navigation.*` - Pagination
- `resourceEditor.representations.*` - All file types (archive, audio, video, document, text, stillImage)
- `resourceEditor.resourceProperties.*` - Property dialogs
- `resourceEditor.resourceCreator.*` - Creation forms
- `resourceEditor.segmentSupport.*` - Segments
- `resourceEditor.template Switcher.*` - Value editors
- `resourceEditor.permissionInfo.*` - Permissions
- `resourceEditor.propertiesDisplay.*` - Property display

Also use `ui.common.actions.*` for common actions like cancel, save, delete, etc.

## Migration Pattern

### 1. Add TranslateService Import

```typescript
import { TranslateService } from '@ngx-translate/core';
import { Component, inject } from '@angular/core';

// Then in class:
private readonly _translateService = inject(TranslateService);
// OR
constructor(private readonly _translateService: TranslateService) {}
```

### 2. Template Translations

**Static text:**
```html
<!-- Before -->
<button>Download file</button>

<!-- After -->
<button>{{ 'resourceEditor.representations.downloadFile' | translate }}</button>
```

**Tooltips:**
```html
<!-- Before -->
<button matTooltip="Open in new tab">

<!-- After -->
<button [matTooltip]="'resourceEditor.toolbar.openInNewTab' | translate">
```

**With interpolation:**
```typescript
// Before
this.notification.openSnackBar('ARK URL copied to clipboard!');

// After
this.notification.openSnackBar(
  this._translateService.instant('resourceEditor.toolbar.arkUrlCopied')
);
```

**With parameters:**
```typescript
// Before
const message = `Share resource: ${resource.versionArkUrl}`;

// After
const message = this._translateService.instant(
  'resourceEditor.toolbar.shareResource',
  { arkUrl: resource.versionArkUrl }
);
```

## File-by-File Migration Checklist

### Core Components (libs/vre/resource-editor/resource-editor/src/lib/)

- [x] resource-toolbar.component.ts
- [x] resource-edit-more-menu.component.ts
- [x] resource-info-bar.component.ts
- [x] resource-legal.component.ts
- [ ] resource-header.component.ts - `editLabel` tooltip
- [ ] permission-info.component.html - `tooltip`
- [ ] compound/compound-navigation.component.ts - All pagination labels
- [ ] compound/compound-arrow-navigation.component.ts
- [ ] annotation-tab.component.ts
- [ ] segment-tab.component.ts
- [ ] closing-dialog.component.ts
- [ ] alert-info.component.ts

### Representations (libs/vre/resource-editor/representations/src/lib/)

#### Archive
- [ ] archive/archive.component.html - "Download file", "Replace file", error message
- [ ] archive/archive.component.ts - Dialog title/subtitle

#### Audio
- [ ] audio/audio.component.html - "Your browser does not support..."
- [ ] audio/audio.component.ts - Error messages
- [ ] audio/audio-more-button.component.ts - All button labels, dialog title

#### Video
- [ ] video/video.component.ts - All error messages
- [ ] video/video-more-button.component.ts - All button labels
- [ ] video/video-toolbar.component.ts - Play/pause/stop tooltips

#### Document
- [ ] document/document.component.html - Search placeholder, zoom buttons, fullscreen
- [ ] document/document.component.ts - Dialog title/subtitle

#### Text
- [ ] text/text.component.html - "Download file", "Replace file", error message
- [ ] text/text.component.ts - Dialog title/subtitle

#### Still Image
- [ ] still-image/still-image-toolbar.component.html - All tooltips, button labels, notifications

#### Common
- [ ] add-region-form-dialog.component.ts - Subtitle, labels
- [ ] replace-file-dialog/replace-file-dialog.component.ts - "will be replaced"

### Resource Properties (libs/vre/resource-editor/resource-properties/src/lib/)

- [ ] delete-value-dialog.component.ts - Title, explanation, labels, buttons
- [ ] edit-resource-label-dialog.component.ts - Subtitle, label, buttons
- [ ] erase-resource-dialog.component.ts - Title, subtitle, warning, labels, buttons
- [ ] property-value-add.component.ts - "The value entered already exists"

### Properties Display (libs/vre/resource-editor/properties-display/src/lib/)

- [ ] delete-resource-dialog.component.ts - Title, labels, placeholder, buttons
- [ ] annotation-toolbar.component.ts - All tooltips, notifications

### Resource Creator (libs/vre/resource-editor/resource-creator/src/lib/)

- [ ] create-resource-form.component.ts - Headings, labels, tooltips, placeholders
- [ ] create-resource-form-legal.component.ts - All form labels, options
- [ ] authorship-form-field.component.ts - Labels, placeholders, instructions, default options
- [ ] upload.component.ts - Drag/drop text, progress messages, error messages
- [ ] create-resource-dialog.component.ts - Dialog title

### Segment Support (libs/vre/resource-editor/segment-support/src/lib/)

- [ ] create-segment-dialog.component.ts - All form labels, buttons

### Template Switcher (libs/vre/resource-editor/template-switcher/src/lib/)

- [ ] template-viewer-switcher.component.ts - "Nothing to show"
- [ ] nullable-editor.component.ts - "Remove", "Add", tooltips
- [ ] create-resource-dialog.component.ts - Dialog title

## Quick Reference: Common Replacements

| Hardcoded String | Translation Key |
|-----------------|----------------|
| "Cancel" | `'ui.common.actions.cancel' \| translate` |
| "Save" / "Submit" | `'ui.common.actions.save' \| translate` OR `'ui.common.actions.submit' \| translate` |
| "Delete" | `'ui.common.actions.delete' \| translate` |
| "Update" | `'ui.common.actions.update' \| translate` |
| "Edit" | `'ui.common.actions.edit' \| translate` |
| "Close" | `'ui.common.actions.close' \| translate` |
| "Download file" | `'resourceEditor.representations.downloadFile' \| translate` |
| "Replace file" | `'resourceEditor.representations.replaceFile' \| translate` |
| "Open in new tab" | `'resourceEditor.toolbar.openInNewTab' \| translate` |
| "Copy ARK url" | `'resourceEditor.toolbar.copyArkUrl' \| translate` |
| "ARK URL copied to clipboard!" | `_translateService.instant('resourceEditor.toolbar.arkUrlCopied')` |
| "Zoom in" | `'resourceEditor.representations.document.zoomIn' \| translate` |
| "Zoom out" | `'resourceEditor.representations.document.zoomOut' \| translate` |
| "Fullscreen" | `'resourceEditor.representations.document.fullscreen' \| translate` |
| "Label" | `'resourceEditor.segmentSupport.createSegmentDialog.label' \| translate` OR `'ui.common.fields.*'` |
| "Comment" | `'resourceEditor.resourceProperties.comment' \| translate` |
| "Loading..." | `'ui.common.status.loading' \| translate` OR `'resourceEditor.resourceCreator.legal.loading' \| translate` |
| "Choose" | `'resourceEditor.resourceCreator.legal.choose' \| translate` |
| "None" | `'resourceEditor.resourceCreator.legal.none' \| translate` |

## Testing After Migration

After updating each file:

1. **Syntax check:**
   ```bash
   npm run lint-local
   ```

2. **Build check:**
   ```bash
   npm run build
   ```

3. **Visual check:**
   - Start the app: `npm run start-local`
   - Navigate to the affected component
   - Switch between languages (EN, DE, FR, IT) to verify translations
   - Look for any `[Missing: ...]` text in the UI

## Validation Scripts

Use these scripts to validate your changes:

```bash
# Validate JSON syntax
./scripts/validate-translations.sh

# Check key parity
./scripts/compare-translation-keys.sh

# Both
./scripts/validate-translations.sh && ./scripts/compare-translation-keys.sh
```

## Common Pitfalls

1. **Don't forget to inject TranslateService** - Component won't compile without it
2. **Use square brackets for attribute bindings** - `[matTooltip]="..."` not `matTooltip="..."`
3. **Use instant() for TypeScript** - Can't use pipe in .ts files
4. **Preserve interpolation parameters** - `{{arkUrl}}`, `{{types}}`, `{{extension}}`
5. **Use ui.common.actions.* for common actions** - Don't duplicate in resourceEditor section

## Examples of Completed Migrations

See these files for reference:
- `libs/vre/resource-editor/resource-editor/src/lib/resource-toolbar.component.ts`
- `libs/vre/resource-editor/resource-editor/src/lib/resource-edit-more-menu.component.ts`
- `libs/vre/resource-editor/resource-editor/src/lib/resource-info-bar.component.ts`

## Questions?

- Check `docs/TRANSLATION_REFACTORING.md` for general translation guidelines
- Check `apps/dsp-app/src/assets/i18n/CLAUDE.md` for translation file structure
- Review completed files for patterns

---

**Last Updated:** 2025-10-20
**Migration Status:** 3% complete (5/150+ files)
**Translation Keys Status:** 100% complete
