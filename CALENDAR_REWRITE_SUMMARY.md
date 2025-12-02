# Calendar Rewrite - Quick Summary

## 📋 Key Decisions

### 1. **Architecture: Functional Core + Imperative Shell**
```
Pure Functions (Core)     →    Components (Shell)
- Easy to test            →    - Handle UI
- No side effects         →    - Manage forms
- Composable              →    - User interaction
```

### 2. **Type System**
```typescript
// OLD: Weak types, classes, inheritance
class JDNConvertibleCalendar { ... }
class GregorianCalendarDate extends JDNConvertibleCalendar { ... }

// NEW: Strong types, interfaces, composition
interface CalendarDate { readonly calendar: CalendarSystem; ... }
const gregorian: CalendarOperations = { toJDN: ..., fromJDN: ... }
```

### 3. **Structure**
```
OLD:
libs/jdnconvertiblecalendar/           (260 lines in base class)
libs/jdnconvertiblecalendardateadapter/ (412 lines in adapter)
libs/vre/ui/date-picker/               (740 lines in picker)

NEW:
libs/vre/shared/calendar/              (Pure calendar logic, <100 lines per file)
libs/vre/ui/date-input/                (Clean components, <200 lines per file)
```

---

## 🎯 Before & After Comparison

### Creating a Date

**OLD:**
```typescript
const date = new CalendarDate(2024, 1, 15);
const gregorian = new GregorianCalendarDate(new CalendarPeriod(date, date));
```

**NEW:**
```typescript
const gregorian = createDate('GREGORIAN', 2024, 1, 15);
```

### Converting Calendars

**OLD:**
```typescript
const gregorian = new GregorianCalendarDate(jdnPeriod);
const julian = gregorian.convertCalendar('Julian');
```

**NEW:**
```typescript
const julian = convertCalendar(gregorian, 'JULIAN');
```

### Days in Month

**OLD:**
```typescript
const date = new CalendarDate(year, month, 1);
let calDate: JDNConvertibleCalendar;
if (calendar === 'GREGORIAN') {
  calDate = new GregorianCalendarDate(new CalendarPeriod(date, date));
} else if (calendar === 'JULIAN') {
  calDate = new JulianCalendarDate(new CalendarPeriod(date, date));
} else if (calendar === 'ISLAMIC') {
  calDate = new IslamicCalendarDate(new CalendarPeriod(date, date));
} else {
  throw Error(`Unknown calendar ${calendar}`);
}
return calDate.daysInMonth(date);
```

**NEW:**
```typescript
const calendar = getCalendar('GREGORIAN');
return calendar.daysInMonth(year, month);
```

### Using in Components

**OLD:**
```typescript
<app-date-value-handler [formControl]="control" />
// - 332 lines
// - Mixed concerns (UI + validation + conversion)
// - Hard to test
```

**NEW:**
```typescript
<dasch-date-range-input [formControl]="control" />
// - ~150 lines
// - Single responsibility
// - Easy to test
```

---

## 📦 New File Structure

```
libs/vre/shared/calendar/
├── types/
│   ├── calendar.types.ts          # Core types & interfaces
│   ├── calendar-date.ts           # CalendarDate model
│   └── calendar-period.ts         # Period model
├── calendars/
│   ├── gregorian.calendar.ts      # Gregorian operations
│   ├── julian.calendar.ts         # Julian operations
│   └── islamic.calendar.ts        # Islamic operations
├── converters/
│   ├── jdn.converter.ts           # JDN ↔ Calendar
│   └── calendar.converter.ts      # Calendar ↔ Calendar
├── calculators/
│   ├── date.calculator.ts         # Add/subtract dates
│   └── period.calculator.ts       # Period operations
├── factories/
│   ├── calendar.factory.ts        # getCalendar()
│   └── date.factory.ts            # createDate()
└── formatters/
    └── date.formatter.ts          # Format dates

libs/vre/ui/date-input/
├── components/
│   ├── date-input/                # Simple date input
│   ├── date-range-input/          # Period input
│   ├── timestamp-input/           # Date + time
│   └── calendar-picker/           # Material integration
├── adapters/
│   ├── knora-date.adapter.ts      # KnoraDate adapter
│   └── material-date.adapter.ts   # Material adapter
├── validators/
│   └── date.validators.ts         # Form validators
└── services/
    └── date-formatter.service.ts  # Formatting service
```

---

## 🔄 Migration Path

```
Phase 1: Design ✓ (Current)
    ↓
Phase 2: Core Library (3-4 days)
    ↓
Phase 3: Angular Integration (2-3 days)
    ↓
Phase 4: UI Components (4-5 days)
    ↓
Phase 5: Migration & Testing (3-4 days)
    ↓
Phase 6: Cleanup (2 days)
```

### Migration Order (Phase 5)
1. TimeValueComponent (simplest)
2. Advanced Search (isolated)
3. Resource Editor (critical)

---

## ✅ Success Metrics

| Metric | Target | Current (Old) |
|--------|--------|---------------|
| Largest file size | <200 lines | 740 lines |
| Test coverage | >95% | ~60% |
| Type safety | 100% (no `any`) | ~70% |
| Cyclomatic complexity | <10 | 15-20 |
| Duplicate code | 0 | ~200 lines |

---

## 🚀 Quick Start (After Phase 2)

```typescript
// Install (after merge)
import { createDate, convertCalendar } from '@dasch-swiss/vre/shared/calendar';

// Create a date
const date = createDate('GREGORIAN', 2024, 1, 15);

// Convert
const julian = convertCalendar(date, 'JULIAN');

// Format
const formatted = formatDate(date, 'DD-MM-YYYY');

// Use in component
<dasch-date-input [formControl]="dateControl" />
```

---

## ❓ Questions to Resolve

Before starting Phase 2, please confirm:

1. ✅ Architecture approach (functional core + imperative shell)
2. ✅ Directory structure (`libs/vre/shared/calendar` + `libs/vre/ui/date-input`)
3. ✅ Migration strategy (parallel implementation, gradual migration)
4. ✅ Type definitions look good
5. ✅ API examples are clear

**Ready to proceed to Phase 2?**
