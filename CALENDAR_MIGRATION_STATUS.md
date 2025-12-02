# Calendar Migration Status

This document tracks the migration from the old calendar system to the new one.

---

## Overview

**Total Files to Migrate:** 7 files in `libs/vre/`

**Test Results:**
- Core Library: 28 tests passing ✅
- Angular Integration: 107 tests passing ✅
- UI Components: 63 tests passing ✅
- **Total: 198 tests passing** ✅

---

## Migration Status

### ✅ Completed

1. **Phase 1: Requirements & Design**
   - Architecture document created
   - API design completed
   - Migration strategy defined

2. **Phase 2: Core Calendar Library**
   - `libs/vre/shared/calendar/` created
   - Pure TypeScript calendar implementation
   - 28 tests passing
   - Functional, immutable, type-safe

3. **Phase 3: Angular Integration Layer**
   - KnoraDate adapter (25 tests)
   - Angular Material DateAdapter (43 tests)
   - Date formats configuration
   - Form validators (39 tests)
   - 107 tests passing total

4. **Phase 4: UI Components**
   - DateInputComponent (24 tests)
   - DateRangeInputComponent (39 tests)
   - 63 tests passing total
   - Full Material integration

5. **Phase 5.1: Migration Planning**
   - Migration guide created
   - Usage identified (7 files)
   - This status document

---

## Files Requiring Migration

### 1. UI Date Picker Library

| File | Status | Priority | Notes |
|------|--------|----------|-------|
| `libs/vre/ui/date-picker/src/lib/app-date-picker/app-date-picker.component.ts` | ✅ **Completed** | High | Migrated to use new calendar system |
| `libs/vre/ui/date-picker/src/lib/date-value-handler/date-value-handler.component.ts` | ✅ **Completed** | High | Migrated to use new CalendarDate |
| `libs/vre/ui/date-picker/src/lib/date-value-handler/value.service.ts` | ✅ **Completed** | Medium | Migrated to use new calendar API |
| `libs/vre/ui/date-picker/src/lib/jdn-datepicker-directive/jdndatepicker.directive.ts` | ✅ **Completed** | Low | Updated to use CalendarDateAdapter |

### 2. Resource Editor

| File | Status | Priority | Notes |
|------|--------|----------|-------|
| `libs/vre/resource-editor/template-switcher/src/lib/value-components/time-value.component.ts` | ✅ **Completed** | High | Updated to use CalendarDate |
| `libs/vre/resource-editor/resource-properties/src/lib/date-time-timestamp.ts` | ✅ **Completed** | High | Migrated to use new calendar API |
| `libs/vre/resource-editor/resource-properties/src/lib/date-time.ts` | ✅ **Completed** | High | Updated DateTime class to use CalendarDate |

---

## Migration Approach

### Strategy

We'll use a **gradual migration** approach:

1. **Keep both systems running** during migration (no breaking changes initially)
2. **Migrate file-by-file** starting with utilities, then components
3. **Test thoroughly** after each migration
4. **Remove old system** only after all migrations complete

### Order of Migration

```
1. Utility files (date-time.ts, date-time-timestamp.ts)
   ↓
2. Services (value.service.ts)
   ↓
3. Components (date-value-handler, time-value, app-date-picker)
   ↓
4. Directives (jdndatepicker.directive.ts)
   ↓
5. Update all imports and references
   ↓
6. Remove old libraries
```

---

## Detailed Migration Plan

### Step 1: Utility Files (Priority: High)

**Files:**
- `date-time.ts`
- `date-time-timestamp.ts`

**Actions:**
1. Create new utility functions using new calendar system
2. Keep old functions as deprecated
3. Add migration comments
4. Update tests

**Estimated Time:** 2-3 hours

---

### Step 2: Services (Priority: Medium)

**Files:**
- `value.service.ts`

**Actions:**
1. Update service to use new calendar types
2. Update dependencies
3. Add adapter functions for backward compatibility
4. Update tests

**Estimated Time:** 1-2 hours

---

### Step 3: Components (Priority: High)

**Files:**
- `time-value.component.ts`
- `date-value-handler.component.ts`
- `app-date-picker.component.ts`

**Actions:**
1. Replace old components with new DateInputComponent
2. Update templates
3. Update form controls
4. Update validators
5. Test thoroughly

**Estimated Time:** 4-6 hours

---

### Step 4: Directives (Priority: Low)

**Files:**
- `jdndatepicker.directive.ts`

**Actions:**
1. Evaluate if directive is still needed
2. If needed, rewrite using new calendar system
3. If not needed, mark as deprecated
4. Update documentation

**Estimated Time:** 1-2 hours

---

### Step 5: Cleanup (Priority: Medium)

**Actions:**
1. Remove old library references
2. Delete deprecated code
3. Update documentation
4. Remove unused imports
5. Run full test suite

**Estimated Time:** 2-3 hours

---

## Testing Strategy

### Unit Tests

- ✅ Core library: 28 tests passing
- ✅ Angular integration: 107 tests passing
- ✅ UI components: 63 tests passing
- ✅ Migrated components: All tests passing (217 total tests)
  - calendar: 28 tests
  - vre-ui-date-picker: 173 tests
  - template-switcher: 1 test
  - vre-resource-editor-resource-properties: 15 tests

### Integration Tests

- ✅ Component integration (verified through unit tests)
- ✅ Form integration (verified through unit tests)
- ✅ DSP-API integration (KnoraDate adapters tested)

### E2E Tests

- ⏳ Date input flows (to be tested in full application)
- ⏳ Date range selection (to be tested in full application)
- ⏳ Calendar conversion (tested at unit level)
- ⏳ Validation scenarios (tested at unit level)

---

## Risk Assessment

### Low Risk ✅

- Core calendar library (fully tested, no dependencies)
- Validators (isolated, well-tested)
- Date formats (configuration only)

### Medium Risk ⚠️

- Utility functions (used in multiple places)
- Services (dependencies on other services)
- Material adapter (integration with Angular Material)

### High Risk 🔴

- Component migration (user-facing changes)
- Form integration (potential breaking changes)
- DSP-API integration (external dependency)

---

## Mitigation Strategies

### For High-Risk Items

1. **Feature flags** - Allow toggling between old/new systems
2. **A/B testing** - Test with subset of users first
3. **Comprehensive testing** - Unit, integration, E2E
4. **Rollback plan** - Keep old system available for quick rollback

### For Medium-Risk Items

1. **Adapter pattern** - Provide adapters for gradual migration
2. **Deprecation warnings** - Warn about deprecated usage
3. **Documentation** - Clear migration guide

### For Low-Risk Items

1. **Standard testing** - Unit tests sufficient
2. **Code review** - Peer review before merge

---

## Rollback Plan

If migration encounters critical issues:

1. **Immediate:** Revert to old system using git
2. **Short-term:** Keep both systems running, disable new system
3. **Long-term:** Address issues, plan new migration attempt

**Rollback Triggers:**
- Critical bugs in production
- Test failures > 5%
- Performance degradation > 20%
- User complaints > normal baseline

---

## Success Criteria

### Must Have ✅

- [ ] All 7 files migrated
- [ ] All existing tests pass
- [ ] New tests for migrated code pass
- [ ] No breaking changes to public API (where possible)
- [ ] Documentation updated

### Should Have 🎯

- [ ] Performance improvement (or at least no degradation)
- [ ] Better type safety
- [ ] Reduced code complexity
- [ ] Improved UX

### Nice to Have 💡

- [ ] Additional features (e.g., better validation)
- [ ] Better error messages
- [ ] Accessibility improvements

---

## Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Requirements & Design | 2 hours | ✅ Complete |
| Phase 2: Core Library | 3 hours | ✅ Complete |
| Phase 3: Angular Integration | 2 hours | ✅ Complete |
| Phase 4: UI Components | 3 hours | ✅ Complete |
| Phase 5.1: Migration Planning | 1 hour | ✅ Complete |
| Phase 5.2: Utility Migration | 2 hours | ✅ Complete |
| Phase 5.3: Service Migration | 1 hour | ✅ Complete |
| Phase 5.4: Component Migration | 3 hours | ✅ Complete |
| Phase 5.5: Testing | 2 hours | ✅ Complete |
| Phase 6: Cleanup & Documentation | In Progress | ⏳ Pending |
| **Total** | **19 hours (actual)** | **95% Complete** |

---

## Next Steps

1. ✅ Create migration guide → **DONE**
2. ✅ Identify all migration points → **DONE**
3. ✅ Create migration status document → **DONE**
4. ✅ Migrate all 7 identified files → **DONE**
5. ✅ Run comprehensive tests (217 tests passing) → **DONE**
6. ⏳ Review remaining cleanup tasks
7. ⏳ Consider removing old libraries (jdnconvertiblecalendar, jdnconvertiblecalendardateadapter)
8. ⏳ Update project documentation

---

## Notes

- Migration can be done incrementally
- No need to migrate everything at once
- Old system can coexist with new system during transition
- Focus on high-priority files first
- Test thoroughly at each step

---

## Migration Summary (Phase 5.2-5.5 Completed)

**Date Completed:** 2025-12-02

### Files Migrated (7 total):
1. ✅ `value.service.ts` - Updated `calculateDaysInMonth` and `createJDNCalendarDateFromKnoraDate`
2. ✅ `date-value-handler.component.ts` - Updated `periodStartEndValidator` to use `compareDates`
3. ✅ `time-value.component.ts` - Updated to use `CalendarDate` type
4. ✅ `date-time.ts` - Changed `DateTime` class to use `CalendarDate`
5. ✅ `date-time-timestamp.ts` - Migrated all utility functions to new API
6. ✅ `app-date-picker.component.ts` - Updated `calculateDaysInMonth` method
7. ✅ `jdndatepicker.directive.ts` - Updated to use `CalendarDateAdapter`

### Key Changes:
- Removed all imports from `@dasch-swiss/jdnconvertiblecalendar`
- Replaced with imports from `@dasch-swiss/vre/shared/calendar`
- Updated all calendar creation to use `createDate()` factory function
- Simplified `calculateDaysInMonth` from 17 lines to 4 lines
- Replaced `.toJDNPeriod()` calls with direct `compareDates()` usage
- Updated `DateTime` class to use new `CalendarDate` type
- Migrated `JDNDatepickerDirective` to use `CalendarDateAdapter`

### Test Results:
- **217 total tests passing** across 4 projects
- **0 test failures**
- All migrations backward compatible

---

**Status Last Updated:** 2025-12-02
**Migration Status:** 95% Complete (Phases 1-5 done, Phase 6 in progress)
**Next Review:** Before removing old libraries
