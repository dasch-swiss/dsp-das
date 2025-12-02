# Calendar System Rewrite - Architecture Document

## Executive Summary

Complete rewrite of the calendar system (`jdnconvertiblecalendar`, `jdnconvertiblecalendardateadapter`, and date picker components) with modern TypeScript patterns, better maintainability, and improved developer experience.

**Status:** Phase 1 - Requirements & Design
**Date:** 2025-01-02
**Target Completion:** ~15-20 days

---

## 1. Scope Definition

### 1.1 What Stays the Same

✅ Support for **Gregorian, Julian, and Islamic** calendars
✅ **Julian Day Number (JDN)** as the conversion mechanism
✅ **Date period handling** (different precisions: year, month, day)
✅ Integration with **DSP-API's `KnoraDate` and `KnoraPeriod`**
✅ **Angular Material datepicker** integration
✅ Support for **BCE/CE eras**
✅ **Timestamp support** (date + time)
✅ All **existing functionality** preserved

### 1.2 What Changes

❌ **No class-based OOP hierarchy** - Use functional approach with factory patterns
❌ **No scattered duplicate code** - Single source of truth for each operation
❌ **No weak typing** - Strict TypeScript with no `any` types
❌ **No 740-line components** - Small, focused, composable components
❌ **No magic strings** - Type-safe constants and enums
❌ **No Angular Material coupling in core logic** - Clean separation of concerns
❌ **No mixed responsibilities** - Clear boundaries between layers

### 1.3 Key Improvements

🎯 **Functional core, imperative shell** - Pure functions for logic, components for UI
🎯 **Strong typing** - Compile-time safety with TypeScript
🎯 **Immutability** - All operations return new objects
🎯 **Testability** - Easy to test pure functions
🎯 **Composition** - Build complex behavior from simple functions
🎯 **Clear API surface** - Well-defined public interfaces
🎯 **Better documentation** - JSDoc comments and examples

---

## 2. Requirements

### 2.1 Functional Requirements

#### Core Calendar Operations
- FR-1: Convert dates between Gregorian, Julian, and Islamic calendars
- FR-2: Convert calendar dates to/from Julian Day Numbers
- FR-3: Calculate number of days in a month for any calendar
- FR-4: Determine if a year is a leap year for any calendar
- FR-5: Calculate day of week for any date
- FR-6: Add/subtract days, months, years to/from dates
- FR-7: Compare dates (before, after, equal)
- FR-8: Handle year-zero conventions correctly (BCE/CE)

#### Date Precision
- FR-9: Support year-only precision (e.g., "2024")
- FR-10: Support year-month precision (e.g., "2024-01")
- FR-11: Support full date precision (e.g., "2024-01-15")

#### Date Periods/Ranges
- FR-12: Represent date ranges with start and end dates
- FR-13: Validate that start date is before end date
- FR-14: Support periods with different precisions

#### Integration
- FR-15: Convert between internal CalendarDate and DSP-API KnoraDate
- FR-16: Convert between internal CalendarPeriod and DSP-API KnoraPeriod
- FR-17: Format dates for display in various formats
- FR-18: Parse date strings into internal format
- FR-19: Generate ISO 8601 timestamps
- FR-20: Support Gravsearch date format

### 2.2 Non-Functional Requirements

#### Performance
- NFR-1: Date conversions must complete in <10ms
- NFR-2: Component rendering must be <100ms
- NFR-3: No memory leaks in Angular components

#### Code Quality
- NFR-4: Unit test coverage >95%
- NFR-5: No files >200 lines
- NFR-6: No functions >30 lines
- NFR-7: Cyclomatic complexity <10
- NFR-8: All public APIs documented with JSDoc

#### Maintainability
- NFR-9: Clear separation of concerns (layers)
- NFR-10: No duplicate code
- NFR-11: Type-safe throughout (no `any` types)
- NFR-12: Immutable data structures

#### Compatibility
- NFR-13: Works with Angular 15+
- NFR-14: Works with Angular Material 15+
- NFR-15: Works with TypeScript 5+
- NFR-16: No breaking changes to public API during migration

---

## 3. Architecture

### 3.1 Layer Architecture

```
┌─────────────────────────────────────────────────┐
│         Application Layer (dsp-app)             │
│  - Resource Editor                              │
│  - Advanced Search                              │
│  - Template Switcher                            │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         UI Component Layer                      │
│  libs/vre/ui/date-input/                       │
│  - DateInputComponent                           │
│  - DateRangeInputComponent                      │
│  - TimestampInputComponent                      │
│  - CalendarPickerDirective                      │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Angular Integration Layer               │
│  libs/vre/ui/date-input/adapters/              │
│  - KnoraDateAdapter                             │
│  - CalendarDateAdapter (Material)               │
│  - Validators                                   │
│  - Services                                     │
└────────────────┬────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────┐
│         Core Calendar Layer (Pure)              │
│  libs/vre/shared/calendar/                     │
│  - Calendar types                               │
│  - Calendar operations                          │
│  - Date calculations                            │
│  - JDN conversions                              │
│  - Formatters                                   │
└─────────────────────────────────────────────────┘
```

### 3.2 Directory Structure

```
libs/
├── vre/
│   ├── shared/
│   │   └── calendar/                              # NEW: Core calendar library
│   │       ├── src/
│   │       │   ├── lib/
│   │       │   │   ├── types/
│   │       │   │   │   ├── calendar.types.ts     # Core type definitions
│   │       │   │   │   ├── calendar-date.ts      # CalendarDate model
│   │       │   │   │   └── calendar-period.ts    # CalendarPeriod model
│   │       │   │   ├── calendars/
│   │       │   │   │   ├── gregorian.calendar.ts # Gregorian operations
│   │       │   │   │   ├── julian.calendar.ts    # Julian operations
│   │       │   │   │   └── islamic.calendar.ts   # Islamic operations
│   │       │   │   ├── converters/
│   │       │   │   │   ├── jdn.converter.ts      # JDN conversions
│   │       │   │   │   └── calendar.converter.ts # Calendar conversions
│   │       │   │   ├── calculators/
│   │       │   │   │   ├── date.calculator.ts    # Date arithmetic
│   │       │   │   │   └── period.calculator.ts  # Period operations
│   │       │   │   ├── factories/
│   │       │   │   │   ├── calendar.factory.ts   # Calendar factory
│   │       │   │   │   └── date.factory.ts       # Date creation helpers
│   │       │   │   └── formatters/
│   │       │   │       └── date.formatter.ts     # Date formatting
│   │       │   └── index.ts                       # Public API
│   │       ├── project.json
│   │       ├── tsconfig.json
│   │       └── README.md
│   │
│   └── ui/
│       └── date-input/                            # NEW: Date input components
│           ├── src/
│           │   ├── lib/
│           │   │   ├── components/
│           │   │   │   ├── date-input/
│           │   │   │   │   ├── date-input.component.ts
│           │   │   │   │   ├── date-input.component.html
│           │   │   │   │   ├── date-input.component.scss
│           │   │   │   │   └── date-input.component.spec.ts
│           │   │   │   ├── date-range-input/
│           │   │   │   │   ├── date-range-input.component.ts
│           │   │   │   │   ├── date-range-input.component.html
│           │   │   │   │   ├── date-range-input.component.scss
│           │   │   │   │   └── date-range-input.component.spec.ts
│           │   │   │   ├── timestamp-input/
│           │   │   │   │   ├── timestamp-input.component.ts
│           │   │   │   │   ├── timestamp-input.component.html
│           │   │   │   │   ├── timestamp-input.component.scss
│           │   │   │   │   └── timestamp-input.component.spec.ts
│           │   │   │   └── calendar-picker/
│           │   │   │       ├── calendar-picker.directive.ts
│           │   │   │       └── calendar-picker.directive.spec.ts
│           │   │   ├── adapters/
│           │   │   │   ├── knora-date.adapter.ts          # KnoraDate adapter
│           │   │   │   ├── knora-date.adapter.spec.ts
│           │   │   │   ├── material-date.adapter.ts       # Material adapter
│           │   │   │   └── material-date.adapter.spec.ts
│           │   │   ├── validators/
│           │   │   │   ├── date.validators.ts
│           │   │   │   └── date.validators.spec.ts
│           │   │   └── services/
│           │   │       ├── date-formatter.service.ts
│           │   │       └── date-formatter.service.spec.ts
│           │   └── index.ts                               # Public API
│           ├── project.json
│           ├── tsconfig.json
│           └── README.md
│
└── [OLD CODE - TO BE REMOVED IN PHASE 6]
    ├── jdnconvertiblecalendar/
    └── jdnconvertiblecalendardateadapter/
```

---

## 4. Type Definitions

### 4.1 Core Types

```typescript
// libs/vre/shared/calendar/src/lib/types/calendar.types.ts

/**
 * Supported calendar systems.
 */
export const CALENDAR_SYSTEMS = ['GREGORIAN', 'JULIAN', 'ISLAMIC'] as const;
export type CalendarSystem = typeof CALENDAR_SYSTEMS[number];

/**
 * Era designations for dates.
 * - CE: Common Era (AD)
 * - BCE: Before Common Era (BC)
 * - NONE: No era (used for Islamic calendar)
 */
export const ERAS = ['CE', 'BCE', 'NONE'] as const;
export type Era = typeof ERAS[number];

/**
 * Precision level for dates.
 * - YEAR: Year only (e.g., 2024)
 * - MONTH: Year and month (e.g., 2024-01)
 * - DAY: Full date (e.g., 2024-01-15)
 */
export const DATE_PRECISIONS = ['YEAR', 'MONTH', 'DAY'] as const;
export type DatePrecision = typeof DATE_PRECISIONS[number];

/**
 * Immutable representation of a calendar date.
 */
export interface CalendarDate {
  readonly calendar: CalendarSystem;
  readonly year: number;
  readonly month?: number; // 1-12, undefined if precision is YEAR
  readonly day?: number;   // 1-31, undefined if precision is YEAR or MONTH
  readonly era: Era;
  readonly precision: DatePrecision;
}

/**
 * Immutable representation of a date period/range.
 */
export interface CalendarPeriod {
  readonly start: CalendarDate;
  readonly end: CalendarDate;
}

/**
 * Calendar-specific operations.
 */
export interface CalendarOperations {
  /**
   * Convert a calendar date to Julian Day Number.
   * @param date The calendar date to convert
   * @returns The Julian Day Number (JDN)
   */
  toJDN(date: CalendarDate): number;

  /**
   * Convert a Julian Day Number to a calendar date.
   * @param jdn The Julian Day Number
   * @returns The calendar date
   */
  fromJDN(jdn: number): CalendarDate;

  /**
   * Calculate the number of days in a month.
   * @param year The year (astronomical year, can be negative)
   * @param month The month (1-12)
   * @returns Number of days in the month
   */
  daysInMonth(year: number, month: number): number;

  /**
   * Determine if a year is a leap year.
   * @param year The year (astronomical year, can be negative)
   * @returns True if leap year, false otherwise
   */
  isLeapYear(year: number): boolean;

  /**
   * Calculate the day of week for a date.
   * @param date The calendar date
   * @returns Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
   */
  dayOfWeek(date: CalendarDate): number;
}

/**
 * Date format options.
 */
export type DateFormat =
  | 'DD-MM-YYYY'     // 15-01-2024
  | 'MM-DD-YYYY'     // 01-15-2024
  | 'YYYY-MM-DD'     // 2024-01-15 (ISO)
  | 'DD.MM.YYYY'     // 15.01.2024
  | 'GRAVSEARCH';    // GREGORIAN:2024-01-15 CE

/**
 * Configuration for date formatting.
 */
export interface DateFormatOptions {
  format: DateFormat;
  showEra?: boolean;        // Show CE/BCE
  showCalendar?: boolean;   // Show calendar name
  locale?: string;          // Locale for month/day names
}
```

### 4.2 Factory Function Types

```typescript
/**
 * Creates a calendar date with validation.
 */
export function createDate(
  calendar: CalendarSystem,
  year: number,
  month?: number,
  day?: number,
  era?: Era
): CalendarDate;

/**
 * Creates a calendar period with validation.
 */
export function createPeriod(
  start: CalendarDate,
  end: CalendarDate
): CalendarPeriod;

/**
 * Gets calendar operations for a specific calendar system.
 */
export function getCalendar(system: CalendarSystem): CalendarOperations;
```

---

## 5. API Examples

### 5.1 Creating Dates

```typescript
import { createDate } from '@dasch-swiss/vre/shared/calendar';

// Simple date
const date1 = createDate('GREGORIAN', 2024, 1, 15, 'CE');
// Result: { calendar: 'GREGORIAN', year: 2024, month: 1, day: 15, era: 'CE', precision: 'DAY' }

// Year-only precision
const date2 = createDate('GREGORIAN', 2024);
// Result: { calendar: 'GREGORIAN', year: 2024, era: 'CE', precision: 'YEAR' }

// BCE date
const date3 = createDate('JULIAN', -44, 3, 15, 'BCE');
// Result: { calendar: 'JULIAN', year: -44, month: 3, day: 15, era: 'BCE', precision: 'DAY' }
```

### 5.2 Converting Between Calendars

```typescript
import { createDate, convertCalendar } from '@dasch-swiss/vre/shared/calendar';

const gregorian = createDate('GREGORIAN', 2024, 1, 15);
const julian = convertCalendar(gregorian, 'JULIAN');
// Result: { calendar: 'JULIAN', year: 2024, month: 1, day: 2, ... }

const islamic = convertCalendar(gregorian, 'ISLAMIC');
// Result: { calendar: 'ISLAMIC', year: 1445, month: 7, day: 4, era: 'NONE', ... }
```

### 5.3 Date Arithmetic

```typescript
import { createDate, addDays, addMonths, addYears } from '@dasch-swiss/vre/shared/calendar';

const date = createDate('GREGORIAN', 2024, 1, 15);

const tomorrow = addDays(date, 1);
// Result: 2024-01-16

const nextMonth = addMonths(date, 1);
// Result: 2024-02-15

const nextYear = addYears(date, 1);
// Result: 2025-01-15
```

### 5.4 Date Comparison

```typescript
import { createDate, compareDates, isBefore, isAfter, isEqual } from '@dasch-swiss/vre/shared/calendar';

const date1 = createDate('GREGORIAN', 2024, 1, 15);
const date2 = createDate('GREGORIAN', 2024, 2, 20);

compareDates(date1, date2); // -1 (date1 is before date2)
isBefore(date1, date2);     // true
isAfter(date1, date2);      // false
isEqual(date1, date1);      // true
```

### 5.5 Formatting

```typescript
import { createDate, formatDate } from '@dasch-swiss/vre/shared/calendar';

const date = createDate('GREGORIAN', 2024, 1, 15, 'CE');

formatDate(date, 'DD-MM-YYYY');     // "15-01-2024"
formatDate(date, 'YYYY-MM-DD');     // "2024-01-15"
formatDate(date, 'DD.MM.YYYY');     // "15.01.2024"
formatDate(date, 'GRAVSEARCH');     // "GREGORIAN:2024-01-15 CE"
```

### 5.6 Using with Angular Forms

```typescript
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateInputComponent } from '@dasch-swiss/vre/ui/date-input';
import { CalendarDate } from '@dasch-swiss/vre/shared/calendar';

@Component({
  selector: 'my-form',
  template: `
    <dasch-date-input
      [formControl]="dateControl"
      [allowedCalendars]="['GREGORIAN', 'JULIAN']"
      [minPrecision]="'MONTH'">
    </dasch-date-input>
  `,
})
export class MyFormComponent {
  dateControl = new FormControl<CalendarDate | null>(null);

  ngOnInit() {
    this.dateControl.valueChanges.subscribe(date => {
      console.log('Selected date:', date);
    });
  }
}
```

### 5.7 Integration with KnoraDate

```typescript
import { KnoraDate } from '@dasch-swiss/dsp-js';
import { knoraDateToCalendarDate, calendarDateToKnoraDate } from '@dasch-swiss/vre/ui/date-input/adapters';

// Convert from KnoraDate
const knoraDate = new KnoraDate('GREGORIAN', 'CE', 2024, 1, 15);
const calendarDate = knoraDateToCalendarDate(knoraDate);

// Convert to KnoraDate
const backToKnora = calendarDateToKnoraDate(calendarDate);
```

---

## 6. Migration Strategy

### 6.1 Parallel Implementation

**Phase 2-4:** Build new system alongside old code
- Old: `libs/jdnconvertiblecalendar`, `libs/jdnconvertiblecalendardateadapter`, `libs/vre/ui/date-picker`
- New: `libs/vre/shared/calendar`, `libs/vre/ui/date-input`
- Both coexist during development

### 6.2 Migration Order (Phase 5)

1. **TimeValueComponent** (simplest, least risky)
2. **Advanced Search date input** (isolated usage)
3. **Resource date property editor** (most critical)

### 6.3 Compatibility Layer

```typescript
// Temporary adapter for gradual migration
export function legacyJDNToCalendarDate(
  legacy: JDNConvertibleCalendar
): CalendarDate {
  // Convert old format to new
}
```

### 6.4 Cleanup (Phase 6)

- Remove `libs/jdnconvertiblecalendar`
- Remove `libs/jdnconvertiblecalendardateadapter`
- Remove old `libs/vre/ui/date-picker` (if fully replaced)
- Update all imports
- Update documentation

---

## 7. Testing Strategy

### 7.1 Unit Tests

**Coverage Target:** >95%

```typescript
describe('GregorianCalendar', () => {
  describe('toJDN', () => {
    it('should convert 1/1/2000 correctly', () => {
      const date = createDate('GREGORIAN', 2000, 1, 1);
      expect(GregorianCalendar.toJDN(date)).toBe(2451545);
    });

    it('should handle BCE dates', () => {
      const date = createDate('GREGORIAN', -44, 3, 15, 'BCE');
      expect(GregorianCalendar.toJDN(date)).toBe(1705426);
    });

    it('should handle October 1582 transition', () => {
      // Test Gregorian calendar introduction
    });
  });
});

describe('Date Conversion', () => {
  it('should round-trip correctly', () => {
    const original = createDate('GREGORIAN', 2024, 1, 15);
    const julian = convertCalendar(original, 'JULIAN');
    const backToGregorian = convertCalendar(julian, 'GREGORIAN');
    expect(backToGregorian).toEqual(original);
  });
});
```

### 7.2 Integration Tests

```typescript
describe('DateInputComponent', () => {
  it('should work with Angular Forms', () => {
    const form = new FormGroup({
      date: new FormControl<CalendarDate | null>(null)
    });
    // Test component integration
  });

  it('should validate date ranges', () => {
    // Test period validation
  });
});
```

### 7.3 E2E Tests

```typescript
describe('Resource Date Property', () => {
  it('should create resource with date', () => {
    cy.visit('/resource/new');
    cy.get('[data-cy=date-input]').click();
    cy.get('[data-cy=year-input]').type('2024');
    // ... complete workflow
    cy.get('[data-cy=save]').click();
    // Verify saved correctly
  });
});
```

---

## 8. Performance Targets

| Operation | Target | Rationale |
|-----------|--------|-----------|
| Date conversion | <10ms | User shouldn't notice |
| Component render | <100ms | Smooth UI experience |
| Form validation | <50ms | Immediate feedback |
| JDN calculation | <5ms | Core operation, must be fast |

---

## 9. Success Criteria

✅ All existing functionality preserved
✅ Unit test coverage >95%
✅ Integration tests pass
✅ E2E tests pass
✅ No performance regressions
✅ Code is more maintainable (smaller files, clearer structure)
✅ Documentation complete
✅ Migration complete, old code removed
✅ No complaints from users about broken functionality

---

## 10. Risks & Mitigation

### Risk 1: Calendar Conversion Bugs
**Mitigation:** Extensive testing with known date conversions, compare against old implementation

### Risk 2: Breaking Existing Workflows
**Mitigation:** Parallel implementation, gradual migration, thorough E2E testing

### Risk 3: Performance Issues
**Mitigation:** Performance benchmarks, profile before/after

### Risk 4: Unexpected Edge Cases
**Mitigation:** Test with production data, beta testing phase

---

## 11. Next Steps

1. ✅ **Review this architecture document** - Get approval
2. Create the library structure (`nx generate`)
3. Implement core types
4. Implement calendar operations
5. Write comprehensive tests
6. Proceed to Phase 2

---

**Document Status:** Draft for Review
**Last Updated:** 2025-01-02
**Next Review:** After Phase 1 approval
