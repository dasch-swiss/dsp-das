# Translation Guidelines for DSP-APP

This file provides guidance to Claude Code when working with translation files in this directory.

## Overview

This directory contains internationalization files for the DSP-APP application in JSON format:
- `en.json` - English (reference language)
- `de.json` - German
- `fr.json` - French  
- `it.json` - Italian
- `rm.json` - Romansh

## Core Translation Rules

### 1. Key Parity Requirement
**CRITICAL**: All translation files MUST maintain exact key parity with the English reference file (`en.json`). 
Every key that exists in English must exist in all other language files.

### 2. English as Reference
- `en.json` is the authoritative reference for all translation keys
- Any changes to English keys must be immediately reflected in all other language files
- New keys should always be added to English first, then propagated to other languages
- If no translation is provided by PM for a new key, the English value should be used as a placeholder in the other language files

### 3. Romansh Translation Policy
**IMPORTANT**: For Romansh (`rm.json`) translations:
- **DO NOT** suggest or create Romansh translations unless explicitly instructed
- **ALWAYS** use English values as placeholders for missing or new keys
- When English is updated, immediately update `rm.json` with the same English values
- This ensures functionality remains intact while proper Romansh translations are handled separately

### 4. Translation Consistency
- Maintain consistent terminology across all languages
- When updating translations, ensure the meaning and tone remain consistent
- Consider context and user experience when shortening or modifying text

## Key Parity Verification

Use this Python script to verify that all translation files have matching keys:

```python
#!/usr/bin/env python3
import json
from pathlib import Path

def extract_keys(obj, prefix=""):
    keys = set()
    for key, value in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        keys.add(full_key)
        if isinstance(value, dict):
            keys.update(extract_keys(value, full_key))
    return keys

def check_parity():
    languages = ['en', 'de', 'fr', 'it', 'rm']
    all_keys = {}
    
    for lang in languages:
        with open(f"{lang}.json", encoding='utf-8') as f:
            all_keys[lang] = extract_keys(json.load(f))
    
    reference_keys = all_keys['en']
    print(f"English: {len(reference_keys)} keys")
    
    errors = []
    for lang in ['de', 'fr', 'it', 'rm']:
        lang_keys = all_keys[lang]
        missing = reference_keys - lang_keys
        extra = lang_keys - reference_keys
        
        print(f"{lang.upper()}: {len(lang_keys)} keys")
        if missing: errors.append(f"Missing in {lang}: {sorted(missing)}")
        if extra: errors.append(f"Extra in {lang}: {sorted(extra)}")
    
    if errors:
        print("❌ Issues found:")
        for error in errors: print(f"  {error}")
    else:
        print("✅ All files have matching keys!")

if __name__ == "__main__":
    check_parity()
```

### Usage
```bash
# Save the script as check_parity.py in the i18n directory, then run:
python3 check_parity.py

# For Claude Code: Copy the script above and run with single quotes to avoid escape issues:
cd <i18n_directory_path> && python3 -c '<paste_script_here_with_single_quotes>'
```

## Workflow for Translation Changes

### When Adding New Keys:
1. Add the key to `en.json` with the English text
2. Add the same key to `rm.json` using the English value
3. Add proper translations to `de.json`, `fr.json`, and `it.json`
4. **Update the relevant code** to replace hardcoded text with the translation key (e.g., `"Add user"` → `{{ 'pages.project.add' | translate }}`)
5. Run the parity verification script
6. Test the application to ensure functionality

### When Updating Existing Keys:
1. Update the key in `en.json`
2. Update the same key in `rm.json` with the new English value
3. Update translations in other language files as needed
4. Run the parity verification script
5. Test the application

### When Removing Keys:
1. Remove from `en.json` first
2. Remove from all other language files (`de.json`, `fr.json`, `it.json`, `rm.json`)
3. Verify no references remain in the codebase
4. Run the parity verification script

## Common Issues to Avoid

1. **Partial Updates**: Never update only some language files - always maintain parity
2. **Key Typos**: Double-check key names when copying between files

## Testing Translations

After making translation changes:
1. Run the parity verification script
2. Start the application: `npm run start-local`
3. Switch between languages in the UI to verify functionality
4. Check that no translation keys show as raw keys (e.g., `"pages.project.legalSettings.tab"`)

## Translation Structure

### Overview

The translation files follow a hierarchical structure with two main top-level sections:

1. **`pages.*`** - Feature-specific translations organized by page/module
2. **`ui.*`** - Reusable UI component translations

### New `ui.common` Structure (Refactored)

A centralized `ui.common` structure has been introduced to eliminate duplication and improve maintainability:

```
ui.common/
├── actions/          # Common action button labels (cancel, save, update, delete, etc.)
├── fields/           # Common form field labels (username, email, password, etc.)
├── status/           # Status indicators (active, inactive, loading, etc.)
├── states/           # UI states (loading, empty, noResults, etc.)
├── entities/         # Common entity names (user/users, project/projects, etc.)
├── confirmations/    # Reusable confirmation message templates with interpolation
└── sort/             # Sort option labels (byName, byDate, ascending, descending)
```

### Decision Tree: `ui.common` vs `pages.*`

**Use `ui.common` when:**
- The text is used in 3+ different feature areas
- It's a standard action/field/status label
- The text is generic and context-independent
- It's a reusable confirmation message template

**Use `pages.*` when:**
- The text has business domain-specific context
- The text is unique to one feature
- The text includes feature-specific terminology

**Examples:**

✅ **Good:**
```typescript
'ui.common.actions.cancel'              // Generic action button
'ui.common.fields.username'             // Generic field label
'ui.common.status.active'               // Generic status
'pages.search.advancedSearch.title'     // Feature-specific title
```

❌ **Bad:**
```typescript
'pages.search.cancel'                   // Don't duplicate common actions!
'pages.system.loading'                  // Don't duplicate common states!
```

### Key Referencing in Code

Keys use dot notation in the application code:

**Template usage (HTML):**
```html
<button mat-button>{{ 'ui.common.actions.cancel' | translate }}</button>
<mat-label>{{ 'ui.common.fields.username' | translate }}</mat-label>
```

**TypeScript usage:**
```typescript
const message = this._translateService.instant('ui.common.confirmations.deleteItem', { item: 'user' });
```

### Validation Scripts

Automated validation scripts are available in the `scripts/` directory:

```bash
# Validate JSON syntax
./scripts/validate-translations.sh

# Check key parity across all languages
./scripts/compare-translation-keys.sh

# Migrate legacy ui.form.action keys
./scripts/migrate-ui-actions.sh
```

### Further Reading

For detailed information about the refactored structure, see:
- `docs/TRANSLATION_REFACTORING.md` - Complete refactoring guide and usage patterns
- Migration guide and decision trees
- Benefits and impact analysis

### File Structure Notes

Check `apps/dsp-app/src/assets/i18n/en.json` for the English reference file structure
