# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Permission Protocol

**ALWAYS ask for explicit permission before:**
- Making any code changes or modifications
- Creating new files or directories  
- Deleting or removing any files
- Running commands that modify the codebase
- Installing or updating dependencies
- Making commits or pushing changes

Only proceed with changes after receiving clear approval from the user.

## Project Overview

This is DaSCH Service Platform (DSP) monorepo - a digital humanities platform for storing, sharing, and working with primary research resources and data. Built with Angular 17.3.0, NX 19.0.8, and Node.js 20.9.0.

The main application is **DSP-APP** - a user interface for the Swiss National Data and Service Center for the Humanities (DaSCH) research data repository, connecting to DSP-API backend and implementing DSP-JS client library.

## Essential Development Commands

### Local Development
- `npm run start-local` or `nx run dsp-app:serve` - Start local development server
- `npm run start-test` - Start with test server configuration
- `npm run start-dev` - Start with dev server configuration

### Testing
- `npm run test-local` or `nx run dsp-app:test` - Run tests for main app
- `npm run test-ci-all` or `nx run-many --all --target=test --configuration=ci` - Run all tests in CI mode
- `npm run e2e-local` - Open Cypress UI for E2E tests  
- `npm run e2e-ci` - Run E2E tests in headless mode

### Building and Linting
- `npm run build` or `nx run dsp-app:build` - Build for development
- `npm run build-prod` or `nx run dsp-app:build:production` - Build for production
- `npm run lint-local` or `nx run dsp-app:lint --fix` - Lint with auto-fix
- `npm run lint-ci` or `nx run dsp-app:lint` - Lint without auto-fix

### Library Development
- `nx run [library-name]:test` - Test specific library
- `nx run [library-name]:lint` - Lint specific library
- `nx run [library-name]:build` - Build specific library

## Architecture Overview

### Monorepo Structure
- **apps/dsp-app/** - Main Angular application
- **apps/dateAdapter/** - Standalone date adapter application
- **libs/vre/** - Virtual Research Environment libraries (core functionality)
- **libs/jdnconvertiblecalendar/** - Calendar conversion utilities
- **docs/** - MkDocs documentation

### VRE Library Architecture
The `libs/vre/` directory follows domain-driven design with clear separation:

- **3rd-party-services/** - External integrations (analytics, API, OpenAPI)
- **core/** - Foundation services (config, error-handler, session, state)
- **pages/** - Feature pages (ontology, project, search, system, user-settings)
- **resource-editor/** - Resource editing (properties, representations, forms) 
- **shared/** - Common utilities and services
- **ui/** - Reusable UI components

### State Management
Uses **NGXS** for state management with domain-specific states:
- User, Projects, Ontologies, Lists, OntologyClass, Resource, Config states
- Actions and selectors co-located with state files

### Key Patterns
- **Barrel exports** via `*.components.ts` files
- **TypeScript path mapping** with `@dasch-swiss/vre/*` aliases
- **Feature-based organization** by domain
- **Reactive programming** with RxJS observables

## Environment Configurations

Multiple environment configurations available:
- `development` - Local development
- `test-server` - Test server environment
- `dev-server` - Development server environment
- `ls-test-server` - LS test server environment
- `0845-test-server` - Specific test server environment
- `stage-server` - Staging environment
- `production` - Production environment

## Development Notes

### Code Style
- Uses ESLint with Airbnb TypeScript configuration
- Prettier for code formatting
- Import ordering enforced alphabetically
- Focus tests (fit, fdescribe) are banned in CI

### Testing Framework
- **Jest** for unit tests with Angular-specific preset
- **Cypress** for E2E tests with multiple configurations
- **Karma** as fallback test runner for some configurations
- Code coverage reporting available

### NX Integration  
- Libraries can be tested/built independently
- Dependency graph enforcement via ESLint rules
- Caching enabled for build, test, and lint operations
- Uses NX Console for IDE integration

### Internationalization
Multi-language support with translation files in:
- `apps/dsp-app/src/assets/i18n/` (de.json, en.json, fr.json, it.json, rm.json)

### Resource Management
Application handles various file types and representations:
- Images, videos, audio files with annotation support
- PDF documents and text files
- IIIF integration for image viewing
- Media segment annotations for time-based resources

## Working with APIs

- **DSP-API** backend integration via DSP-JS client library
- **OpenAPI** generated client in `libs/vre/3rd-party-services/open-api`
- Authentication via JWT tokens managed by session services
- Error handling centralized in core error-handler library

## External Dependencies

Key external libraries:
- **@dasch-swiss/dsp-js** - DSP API client library
- **@angular/material** - UI components
- **@ngxs/store** - State management
- **openseadragon** - Image viewer
- **ckeditor5-custom-build** - Rich text editing
- **cypress** - E2E testing