# Calendar System Migration Guide

This guide helps you migrate from the old calendar system (jdnconvertiblecalendar) to the new modern calendar system.

---

## Table of Contents

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Breaking Changes](#breaking-changes)
4. [Migration Steps](#migration-steps)
5. [API Comparison](#api-comparison)
6. [Component Migration](#component-migration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The new calendar system provides:
- ✅ **Type-safe** - No `any` types, full TypeScript safety
- ✅ **Functional** - Pure functions, easy to test
- ✅ **Modern** - Signals, Control Flow syntax, standalone components
- ✅ **Well-tested** - 198 tests passing
- ✅ **Clean API** - Simple, intuitive function calls
- ✅ **Better UX** - Improved components with better validation

---

## What Changed

### Old System (jdnconvertiblecalendar)
```
libs/jdnconvertiblecalendar/
libs/jdnconvertiblecalendardateadapter/
libs/vre/ui/date-picker/ (old components)
```

### New System
```
libs/vre/shared/calendar/          # Core library
libs/vre/ui/date-picker/           # Angular integration
  ├── adapters/                    # CalendarDateAdapter, KnoraDate adapter
  ├── validators/                  # Form validators
  └── components/                  # New components
```

---

## Breaking Changes

### 1. Import Paths

**Old:**
```typescript
import { JDNConvertibleCalendar } from '@dasch-swiss/jdnconvertiblecalendar';
```

**New:**
```typescript
import { createDate, convertCalendar } from '@dasch-swiss/vre/shared/calendar';
```

### 2. Date Representation

**Old:**
```typescript
// Class-based, mutable
const date = new CalendarDate(2024, 1, 15);
date.year = 2025; // Can mutate
```

**New:**
```typescript
// Functional, immutable
const date = createDate('GREGORIAN', 2024, 1, 15);
// date is readonly, cannot mutate
```

### 3. Calendar Conversion

**Old:**
```typescript
const gregorian = new GregorianCalendarDate(calendarPeriod);
const julian = gregorian.convertCalendar('Julian');
```

**New:**
```typescript
const gregorian = createDate('GREGORIAN', 2024, 1, 15);
const julian = convertCalendar(gregorian, 'JULIAN');
```

### 4. KnoraDate Integration

**Old:**
```typescript
// Direct KnoraDate usage
const knoraDate = new KnoraDate('GREGORIAN', 'CE', 2024, 1, 15);
```

**New:**
```typescript
// Use adapter for conversion
import { calendarDateToKnoraDate } from '@dasch-swiss/vre/ui/date-picker';

const calendarDate = createDate('GREGORIAN', 2024, 1, 15);
const knoraDate = calendarDateToKnoraDate(calendarDate);
```

### 5. Components

**Old:**
```html
<app-date-picker [valueRequiredValidator]="false"></app-date-picker>
```

**New:**
```html
<app-date-input
  [calendarSystem]="'GREGORIAN'"
  [required]="false">
</app-date-input>
```

---

## Migration Steps

### Step 1: Update Imports

Replace old imports with new ones.

**Before:**
```typescript
import { JDNConvertibleCalendar } from '@dasch-swiss/jdnconvertiblecalendar';
import { JDNConvertibleCalendarDateAdapter } from '@dasch-swiss/jdnconvertiblecalendardateadapter';
```

**After:**
```typescript
import {
  createDate,
  createPeriod,
  convertCalendar,
  compareDates,
} from '@dasch-swiss/vre/shared/calendar';

import {
  CalendarDateAdapter,
  knoraDateToCalendarDate,
  calendarDateToKnoraDate,
} from '@dasch-swiss/vre/ui/date-picker';
```

### Step 2: Replace Date Creation

**Before:**
```typescript
const date = new CalendarDate(2024, 1, 15);
const period = new CalendarPeriod(start, end);
```

**After:**
```typescript
const date = createDate('GREGORIAN', 2024, 1, 15);
const period = createPeriod(start, end);
```

### Step 3: Replace Calendar Conversion

**Before:**
```typescript
const gregorian = new GregorianCalendarDate(period);
const julian = gregorian.convertCalendar('Julian');
```

**After:**
```typescript
const gregorian = createDate('GREGORIAN', 2024, 1, 15);
const julian = convertCalendar(gregorian, 'JULIAN');
```

### Step 4: Replace Date Comparison

**Before:**
```typescript
if (date1.year < date2.year) { }
```

**After:**
```typescript
if (compareDates(date1, date2) < 0) { }
// Or use helper functions
if (isBefore(date1, date2)) { }
if (isAfter(date1, date2)) { }
if (isEqual(date1, date2)) { }
```

### Step 5: Update Components

Replace old date picker components with new ones.

**Before:**
```html
<app-date-picker
  [valueRequiredValidator]="false"
  [(ngModel)]="dateValue">
</app-date-picker>
```

**After:**
```html
<app-date-input
  [calendarSystem]="'GREGORIAN'"
  [required]="false"
  formControlName="dateValue">
</app-date-input>
```

### Step 6: Update Form Validators

**Before:**
```typescript
// Custom validators in component
validateDate(control: FormControl) {
  // Complex validation logic
}
```

**After:**
```typescript
import { dateValidator, dateRange } from '@dasch-swiss/vre/ui/date-picker';

const control = new FormControl(null, [
  dateValidator(),
  dateRange(minDate, maxDate),
]);
```

---

## API Comparison

### Core Calendar Operations

| Old API | New API | Notes |
|---------|---------|-------|
| `new CalendarDate(year, month, day)` | `createDate('GREGORIAN', year, month, day)` | Requires calendar system |
| `new CalendarPeriod(start, end)` | `createPeriod(start, end)` | Factory function |
| `date.convertCalendar('Julian')` | `convertCalendar(date, 'JULIAN')` | Pure function |
| Manual comparison | `compareDates(a, b)` | Returns -1, 0, or 1 |
| N/A | `isBefore(a, b)` | New helper |
| N/A | `isAfter(a, b)` | New helper |
| N/A | `isEqual(a, b)` | New helper |

### Date Components

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `app-date-picker` | `app-date-input` | Simpler API |
| N/A | `app-date-range-input` | New for periods |
| Custom directive | Built-in Material integration | Uses DateAdapter |

### Validators

| Old Approach | New Approach | Notes |
|--------------|--------------|-------|
| Custom validation | `dateValidator()` | Built-in |
| Manual range check | `dateRange(min, max)` | Built-in |
| N/A | `beforeDate(max)` | New |
| N/A | `afterDate(min)` | New |
| N/A | `periodValidator()` | New |
| N/A | `minPrecision('DAY')` | New |

---

## Component Migration

### Example 1: Simple Date Input

**Before:**
```typescript
@Component({
  template: `
    <app-date-picker
      [valueRequiredValidator]="true"
      [(ngModel)]="birthDate">
    </app-date-picker>
  `
})
export class OldComponent {
  birthDate: CalendarDate;
}
```

**After:**
```typescript
@Component({
  imports: [DateInputComponent, ReactiveFormsModule],
  template: `
    <app-date-input
      [label]="'Birth Date'"
      [calendarSystem]="'GREGORIAN'"
      [required]="true"
      formControlName="birthDate">
    </app-date-input>
  `
})
export class NewComponent {
  form = new FormGroup({
    birthDate: new FormControl<CalendarDate | null>(null),
  });
}
```

### Example 2: Date Range Input

**Before:**
```typescript
@Component({
  template: `
    <app-date-picker [(ngModel)]="startDate"></app-date-picker>
    <app-date-picker [(ngModel)]="endDate"></app-date-picker>
  `
})
export class OldComponent {
  startDate: CalendarDate;
  endDate: CalendarDate;
}
```

**After:**
```typescript
@Component({
  imports: [DateRangeInputComponent, ReactiveFormsModule],
  template: `
    <app-date-range-input
      [label]="'Date Range'"
      [calendarSystem]="'GREGORIAN'"
      formControlName="dateRange">
    </app-date-range-input>
  `
})
export class NewComponent {
  form = new FormGroup({
    dateRange: new FormControl<CalendarPeriod | null>(null),
  });
}
```

### Example 3: KnoraDate Integration

**Before:**
```typescript
@Component({})
export class OldComponent {
  saveDate() {
    const knoraDate = new KnoraDate('GREGORIAN', 'CE', 2024, 1, 15);
    this.api.saveDate(knoraDate);
  }
}
```

**After:**
```typescript
import { calendarDateToKnoraDate } from '@dasch-swiss/vre/ui/date-picker';

@Component({})
export class NewComponent {
  saveDate() {
    const calendarDate = createDate('GREGORIAN', 2024, 1, 15);
    const knoraDate = calendarDateToKnoraDate(calendarDate);
    this.api.saveDate(knoraDate);
  }
}
```

### Example 4: Date Validation

**Before:**
```typescript
@Component({})
export class OldComponent {
  validateDate(date: CalendarDate): boolean {
    if (!date) return false;
    if (date.year < 1900) return false;
    if (date.year > 2100) return false;
    return true;
  }
}
```

**After:**
```typescript
import { dateValidator, dateRange } from '@dasch-swiss/vre/ui/date-picker';

@Component({})
export class NewComponent {
  form = new FormGroup({
    date: new FormControl(null, [
      dateValidator(),
      dateRange(
        createDate('GREGORIAN', 1900, 1, 1),
        createDate('GREGORIAN', 2100, 12, 31)
      ),
    ]),
  });
}
```

---

## Testing

### Unit Tests

**Before:**
```typescript
it('should create date', () => {
  const date = new CalendarDate(2024, 1, 15);
  expect(date.year).toBe(2024);
});
```

**After:**
```typescript
it('should create date', () => {
  const date = createDate('GREGORIAN', 2024, 1, 15);
  expect(date.year).toBe(2024);
  expect(date.calendar).toBe('GREGORIAN');
});
```

### Component Tests

**Before:**
```typescript
it('should render date picker', () => {
  const fixture = TestBed.createComponent(DatePickerComponent);
  // Complex setup
});
```

**After:**
```typescript
it('should render date input', () => {
  const fixture = TestBed.createComponent(DateInputComponent);
  fixture.detectChanges();
  expect(fixture.componentInstance).toBeTruthy();
});
```

---

## Troubleshooting

### Issue 1: Type Errors

**Problem:**
```typescript
// Error: Type 'CalendarDate' is not assignable to type 'KnoraDate'
this.api.saveDate(calendarDate);
```

**Solution:**
```typescript
import { calendarDateToKnoraDate } from '@dasch-swiss/vre/ui/date-picker';

const knoraDate = calendarDateToKnoraDate(calendarDate);
this.api.saveDate(knoraDate);
```

### Issue 2: Missing Calendar System

**Problem:**
```typescript
// Error: Calendar system is required
const date = createDate(2024, 1, 15);
```

**Solution:**
```typescript
const date = createDate('GREGORIAN', 2024, 1, 15);
```

### Issue 3: Immutability

**Problem:**
```typescript
// Error: Cannot assign to 'year' because it is a read-only property
date.year = 2025;
```

**Solution:**
```typescript
// Create a new date instead
const newDate = createDate(date.calendar, 2025, date.month, date.day, date.era);
```

### Issue 4: Date Comparison

**Problem:**
```typescript
// Error: Comparing objects directly
if (date1 === date2) { }
```

**Solution:**
```typescript
import { compareDates, isEqual } from '@dasch-swiss/vre/shared/calendar';

if (isEqual(date1, date2)) { }
// Or
if (compareDates(date1, date2) === 0) { }
```

---

## Migration Checklist

### Phase 1: Preparation
- [ ] Review this migration guide
- [ ] Identify all usages of old calendar system
- [ ] Create a migration branch
- [ ] Run existing tests to establish baseline

### Phase 2: Core Library Migration
- [ ] Update imports from jdnconvertiblecalendar
- [ ] Replace CalendarDate creation with createDate()
- [ ] Replace CalendarPeriod creation with createPeriod()
- [ ] Replace calendar conversion logic
- [ ] Replace date comparison logic
- [ ] Update KnoraDate integration

### Phase 3: Component Migration
- [ ] Replace app-date-picker with app-date-input
- [ ] Add app-date-range-input where needed
- [ ] Update form controls to use new components
- [ ] Update validators to use new validator functions
- [ ] Test each migrated component

### Phase 4: Testing
- [ ] Run unit tests
- [ ] Run integration tests
- [ ] Run E2E tests
- [ ] Manual testing of date inputs
- [ ] Test calendar conversions
- [ ] Test DSP-API integration

### Phase 5: Cleanup
- [ ] Remove old jdnconvertiblecalendar library
- [ ] Remove old jdnconvertiblecalendardateadapter library
- [ ] Remove old date picker components
- [ ] Update documentation
- [ ] Remove unused imports

---

## Need Help?

If you encounter issues during migration:

1. Check the [Architecture Document](CALENDAR_REWRITE_ARCHITECTURE.md) for design details
2. Review [Phase 2 Summary](CALENDAR_PHASE2_SUMMARY.md) for core library examples
3. Review [Phase 3 Summary](CALENDAR_PHASE3_SUMMARY.md) for Angular integration
4. Check test files for usage examples
5. Consult the team

---

**Migration created:** 2025-12-02
**Last updated:** 2025-12-02
