# Grafana Faro Integration Plan for DSP-DAS

## Executive Summary

This document provides a comprehensive plan for integrating Grafana Faro Web SDK into the DSP-DAS Angular monorepo for frontend observability, real user monitoring (RUM), and performance tracking.

**Current State**: Grafana Faro packages (v1.19.0) are already installed but not implemented.

**Goal**: Implement production-ready Faro integration with local development support, comprehensive error tracking, performance monitoring, and custom event tracking.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Phase 1: Package Updates and Core Setup](#phase-1-package-updates-and-core-setup)
3. [Phase 2: Architecture Design](#phase-2-architecture-design)
4. [Phase 3: Configuration System](#phase-3-configuration-system)
5. [Phase 4: Implementation Details](#phase-4-implementation-details)
6. [Phase 5: Local Development Setup](#phase-5-local-development-setup)
7. [Phase 6: Grafana Cloud Setup](#phase-6-grafana-cloud-setup)
8. [Phase 7: Testing Strategy](#phase-7-testing-strategy)
9. [Phase 8: Deployment and Rollout](#phase-8-deployment-and-rollout)
10. [Phase 9: Grafana Dashboard Setup](#phase-9-grafana-dashboard-setup)
11. [Phase 10: Documentation and Training](#phase-10-documentation-and-training)
12. [Phase 11: Cost and Performance Considerations](#phase-11-cost-and-performance-considerations)
13. [Phase 12: Migration from Sentry (Optional)](#phase-12-migration-from-sentry-optional-long-term)
14. [Success Metrics](#success-metrics)
15. [Risk Mitigation](#risk-mitigation)
16. [Timeline Estimate](#timeline-estimate)
17. [Recommendation Priority](#recommendation-priority)

---

## Current State Analysis

### Existing Infrastructure

**Already Installed**:
- `@grafana/faro-web-sdk` v1.19.0
- `@grafana/faro-web-tracing` v1.19.0

**Current Instrumentation**:
- **Sentry** for error tracking and performance monitoring (apps/dsp-app/src/main.ts:26-44)
  - Browser tracing integration
  - Session replay (10% sampling, 100% on errors)
  - Release tracking with version
  - Source map upload configured
- **Pendo Analytics** for user analytics (production only)
  - User tracking with UUID v5 hashing
  - Session management integration
  - Environment-specific configuration
- **Custom AppErrorHandler** with notification system
  - HTTP error handling (400, 403, 404, 504)
  - DSP-API error parsing
  - User-friendly error messages
  - Sentry integration

**Architecture Strengths**:
- Structured configuration system via JSON configs per environment
- APP_INITIALIZER pattern already in use (app.module.ts:180-184)
- Clear separation of concerns with VRE library structure
- Existing analytics service in `libs/vre/3rd-party-services/analytics`
- Comprehensive error handling with NgZone for change detection

---

## Phase 1: Package Updates and Core Setup

### 1.1 Upgrade to Faro v2 (Recommended)

**Rationale**: Faro v2 (now production-ready) offers significant improvements:
- **Web Vitals v5** with INP metric (replacing deprecated FID)
- **Cleaner APIs** and simplified setup
- **Better performance** with removed legacy code
- **Improved console instrumentation** configuration
- **Leaner core** with deprecated packages removed

**Action Items**:
1. Upgrade packages in `package.json`:
   ```json
   "@grafana/faro-web-sdk": "^2.0.0",
   "@grafana/faro-web-tracing": "^2.0.0"
   ```
2. Review migration guide at https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/upgrading/upgrade-v2/
3. Test for breaking changes in development environment

**Key Breaking Changes to Note**:
- `session_id` attribute renamed to `session.id`
- Console instrumentation config moves to global Faro setup (not in `getWebInstrumentations()`)
- `FaroSessionSpanProcessor` removed (replaced by `FaroMetaAttributesSpanProcessor`)
- Experimental packages removed

**Benefits**:
- Improved First Input Delay → Interaction to Next Paint (INP) metric
- Better performance with reduced bundle size
- Future-proof for upcoming Faro features

### 1.2 Verify Dependencies

**Ensure compatibility with**:
- Angular 20.2.4 ✓
- TypeScript 5.9.3 ✓
- RxJS 7.8.0 ✓

---

## Phase 2: Architecture Design

### 2.1 Create Faro Service Layer

**Location**: `libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/`

**File Structure**:
```
faro-analytics/
├── faro-analytics.service.ts          # Main Faro service
├── faro-analytics.service.spec.ts     # Unit tests
├── faro-initializer.ts                # APP_INITIALIZER factory
├── faro-config.interface.ts           # TypeScript interfaces
└── faro-instrumentations.ts           # Custom instrumentations
```

**Service Responsibilities**:
- Initialize Faro SDK with environment-specific configuration
- Integrate with existing session management (AuthService, AccessTokenService)
- Provide custom event tracking API
- Handle user identification (similar to Pendo's UUID v5 hashing)
- Manage instrumentation lifecycle
- Graceful degradation when Faro is disabled or unavailable

**Key Methods**:
```typescript
class FaroAnalyticsService {
  setup(): void
  trackEvent(name: string, attributes?: Record<string, any>): void
  trackError(error: Error, context?: Record<string, any>): void
  setUser(userIri: string): void
  removeUser(): void
  addSessionContext(context: Record<string, any>): void
}
```

### 2.2 Instrumentation Strategy

**Automatic Collection** (via `getWebInstrumentations`):
- **Console logs** (info, warn, error, debug) - configurable per environment
- **Uncaught errors** and promise rejections
- **Web Vitals** (LCP, INP/FID, CLS, TTFB, FCP)
- **Page load performance** metrics
- **Network requests** (with filtering for sensitive data)
- **User interactions** (clicks, navigation)

**Custom Collection** (manual tracking):
- DSP-API specific errors (from AppErrorHandler)
- Resource operations (create, update, delete)
- Search queries and performance
- Ontology operations
- IIIF viewer interactions
- Authentication events (login, logout, session expiry)
- Project switching
- Language changes

**Data to Filter/Mask**:
- JWT tokens in headers
- User email addresses (use hashed ID only)
- API keys and passwords
- Personal resource content
- IP addresses (rely on Grafana Cloud's anonymization)

### 2.3 Integration with Existing Error Handler

**Dual-Tracking Approach**:
- **Keep Sentry** for production error tracking (already working well)
- **Add Faro** for broader observability and user session context
- Modify `AppErrorHandler` to push errors to both systems
- Use different error filtering for each system

**Implementation in AppErrorHandler**:
```typescript
// Pseudo-code
handleError(error: any): void {
  // Existing Sentry tracking
  this.sendErrorToSentry(error);

  // New Faro tracking
  if (this.faroService.isEnabled()) {
    this.faroService.trackError(error, {
      route: this.getCurrentRoute(),
      resourceIri: this.getCurrentResourceIri(),
      projectUuid: this.getCurrentProjectUuid()
    });
  }

  // Existing notification logic
  // ...
}
```

**Benefits of Dual Approach**:
- **Sentry**: Deep error stack traces, release tracking, source maps, issue grouping
- **Faro**: Full user journey context, frontend-backend correlation, RUM metrics
- **Gradual migration path**: Can evaluate both systems over 6+ months
- **Redundancy**: Backup if one system has issues

---

## Phase 3: Configuration System

### 3.1 Extend Environment Config Structure

**Add to all config files** (`apps/dsp-app/src/config/config.*.json`):

```json
{
  "dspRelease": "12.0.1",
  "apiProtocol": "http",
  "apiHost": "0.0.0.0",
  "apiPort": 3333,
  "instrumentation": {
    "environment": "local-dev",
    "rollbar": {
      "enabled": false,
      "accessToken": ""
    },
    "faro": {
      "enabled": false,
      "collectorUrl": "",
      "appName": "dsp-app",
      "appVersion": "12.0.1",
      "sessionTracking": {
        "enabled": true,
        "persistent": true,
        "samplingRate": 1.0
      },
      "instrumentations": {
        "console": {
          "enabled": true,
          "disabledLevels": []
        },
        "errors": true,
        "webVitals": true,
        "interactions": true,
        "performance": true
      },
      "beforeSend": {
        "maskSensitiveData": true,
        "excludeUrls": [
          "/assets/",
          "/config/"
        ]
      },
      "batching": {
        "enabled": true,
        "sendTimeout": 250
      }
    }
  }
}
```

**Per-Environment Configuration**:

| Environment | Enabled | Collector URL | Session Sampling | Console Levels | Notes |
|-------------|---------|---------------|------------------|----------------|-------|
| **local-dev** | `false` | Local collector | 100% | All | Or point to local Docker |
| **dev-server** | `true` | Grafana Cloud (dev) | 100% | All | Full logging for debugging |
| **ls-test-server** | `true` | Grafana Cloud (test) | 50% | warn, error | Reduced sampling |
| **stage-server** | `true` | Grafana Cloud (stage) | 50% | warn, error | Testing ground |
| **production** | `true` | Grafana Cloud (prod) | 10% | error | Cost optimization |

**Sampling Strategy**:
- Sessions: 10% in production, 100% in dev/stage
- Errors: Always 100% (capture all errors)
- Performance: 100% (aggregate metrics, not per-user)
- Interactions: Based on session sampling

### 3.2 TypeScript Config Interfaces

**Update**: `libs/vre/core/config/src/lib/config-types.ts`

```typescript
export interface FaroConfig {
  enabled: boolean;
  collectorUrl: string;
  appName: string;
  appVersion: string;
  sessionTracking: {
    enabled: boolean;
    persistent: boolean;
    samplingRate: number;
  };
  instrumentations: {
    console: {
      enabled: boolean;
      disabledLevels: ('log' | 'info' | 'warn' | 'error' | 'debug')[];
    };
    errors: boolean;
    webVitals: boolean;
    interactions: boolean;
    performance: boolean;
  };
  beforeSend: {
    maskSensitiveData: boolean;
    excludeUrls: string[];
  };
  batching: {
    enabled: boolean;
    sendTimeout: number;
  };
}

export interface DspInstrumentationConfig {
  environment: string;
  rollbar: {
    enabled: boolean;
    accessToken: string;
  };
  faro?: FaroConfig; // Add optional Faro config
}
```

### 3.3 Injection Tokens

**Create**: `libs/vre/core/config/src/lib/config.tokens.ts`

```typescript
export const FaroConfigToken = new InjectionToken<FaroConfig>('FaroConfig');
```

**Provider in app.module.ts**:
```typescript
{
  provide: FaroConfigToken,
  useFactory: (appConfigService: AppConfigService) =>
    appConfigService.dspInstrumentationConfig.faro,
  deps: [AppConfigService]
}
```

---

## Phase 4: Implementation Details

### 4.1 Faro Service Implementation

**File**: `libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/faro-analytics.service.ts`

**Key Features**:

1. **Lazy Initialization**:
   - Only initialize when `enabled: true` in config
   - Handle initialization errors gracefully
   - Don't block app startup if Faro fails

2. **Session Management Integration**:
   - Track authenticated vs anonymous users
   - Use UUID v5 hashing for user IDs (consistent with Pendo)
   - Update session on login/logout
   - Add custom session attributes:
     - Current project UUID
     - User role (if public)
     - UI language preference

3. **Custom Meta Attributes**:
   ```typescript
   {
     userId: 'hashed-uuid-v5',
     environment: 'prod',
     appVersion: '12.0.1',
     currentProjectUuid: 'abc-123',
     currentResourceIri: 'http://rdfh.ch/0001/resource-id',
     uiLanguage: 'en',
     viewportSize: '1920x1080',
     connectionType: '4g'
   }
   ```

4. **Error Context Enhancement**:
   - Current route/URL
   - Active resource being viewed/edited
   - Recent user actions (breadcrumb trail)
   - API request details (if applicable)

5. **Rate Limiting**:
   - Prevent flooding with duplicate events
   - Debounce high-frequency events
   - Client-side event aggregation

**Service Skeleton**:
```typescript
@Injectable({
  providedIn: 'root',
})
export class FaroAnalyticsService {
  private config: FaroConfig = inject(FaroConfigToken);
  private authService: AuthService = inject(AuthService);
  private accessTokenService: AccessTokenService = inject(AccessTokenService);
  private faroInstance?: Faro;

  setup(): void {
    if (!this.config?.enabled) {
      return;
    }

    try {
      this.faroInstance = initializeFaro({
        url: this.config.collectorUrl,
        app: {
          name: this.config.appName,
          version: this.config.appVersion,
          environment: this.config.environment,
        },
        instrumentations: [
          ...getWebInstrumentations({
            captureConsole: this.config.instrumentations.console.enabled,
            captureConsoleDisabledLevels: this.config.instrumentations.console.disabledLevels,
          }),
        ],
        sessionTracking: {
          enabled: this.config.sessionTracking.enabled,
          persistent: this.config.sessionTracking.persistent,
          samplingRate: this.config.sessionTracking.samplingRate,
        },
        beforeSend: (item) => this.beforeSendHandler(item),
      });

      this.setupUserTracking();
    } catch (error) {
      console.error('Failed to initialize Faro:', error);
    }
  }

  private setupUserTracking(): void {
    this.authService
      .isCredentialsValid$()
      .pipe(takeUntilDestroyed())
      .subscribe((isValid) => {
        if (!isValid) {
          this.removeUser();
          return;
        }
        const userIri = this.accessTokenService.getTokenUser();
        if (userIri) {
          this.setUser(userIri);
        }
      });
  }

  private setUser(userIri: string): void {
    const hashedUserId = this.hashUserIri(userIri);
    this.faroInstance?.api.setUser({
      id: hashedUserId,
      attributes: {
        environment: this.config.environment,
      },
    });
  }

  private hashUserIri(userIri: string): string {
    return uuidv5(userIri, uuidv5.URL);
  }

  trackEvent(name: string, attributes?: Record<string, any>): void {
    if (!this.faroInstance) return;

    this.faroInstance.api.pushEvent(name, attributes, 'custom');
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.faroInstance) return;

    this.faroInstance.api.pushError(error, {
      context,
      skipDedupe: false,
    });
  }

  private beforeSendHandler(item: any): any {
    if (this.config.beforeSend.maskSensitiveData) {
      // Mask JWT tokens, passwords, etc.
      return this.maskSensitiveData(item);
    }
    return item;
  }
}
```

### 4.2 APP_INITIALIZER Setup

**File**: `libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/faro-initializer.ts`

```typescript
import { FaroAnalyticsService } from './faro-analytics.service';

export function faroInitializer(faroService: FaroAnalyticsService): () => Promise<void> {
  return async () => {
    try {
      faroService.setup();
    } catch (error) {
      console.error('Faro initialization failed:', error);
      // Don't throw - allow app to continue
    }
  };
}
```

**Register in app.module.ts**:
```typescript
import { APP_INITIALIZER } from '@angular/core';
import { FaroAnalyticsService, faroInitializer } from '@dasch-swiss/vre/3rd-party-services/analytics';

@NgModule({
  providers: [
    // Existing providers...
    FaroAnalyticsService,
    {
      provide: APP_INITIALIZER,
      useFactory: faroInitializer,
      deps: [FaroAnalyticsService],
      multi: true,
    },
  ],
})
export class AppModule {}
```

**Initialization Order**:
1. Load config JSON (existing - main.ts:70-74)
2. Initialize Sentry (existing - main.ts:8-45)
3. Bootstrap Angular module
4. **Initialize Faro** (new - via APP_INITIALIZER)
5. Initialize Pendo (existing - after auth check)

### 4.3 Error Handler Enhancement

**File**: `libs/vre/core/error-handler/src/lib/app-error-handler.ts`

**Changes**:
```typescript
import { FaroAnalyticsService } from '@dasch-swiss/vre/3rd-party-services/analytics';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandler implements ErrorHandler {
  constructor(
    private readonly _notification: NotificationService,
    private readonly _appConfig: AppConfigService,
    private readonly _ngZone: NgZone,
    private readonly _faroService: FaroAnalyticsService, // NEW
  ) {}

  handleError(error: any): void {
    // Track error in Faro (NEW)
    this.sendErrorToFaro(error);

    // Existing error handling logic
    if (error instanceof ApiResponseError && error.error instanceof AjaxError) {
      this.handleGenericError(error.error, error.url);
    } else if (error instanceof HttpErrorResponse) {
      this.handleHttpErrorResponse(error);
    } else if (error instanceof UserFeedbackError) {
      this.displayNotification(error.message);
    } else {
      if (this._appConfig.dspInstrumentationConfig.environment !== 'prod') {
        console.error(error);
      }
      this.sendErrorToSentry(error);
    }
  }

  private sendErrorToFaro(error: any): void {
    try {
      const context: Record<string, any> = {
        errorType: error.constructor.name,
      };

      if (error instanceof HttpErrorResponse) {
        context.httpStatus = error.status;
        context.httpUrl = error.url;
      }

      if (error instanceof ApiResponseError) {
        context.apiError = true;
        context.apiUrl = error.url;
      }

      // Don't send UserFeedbackError to Faro (not bugs)
      if (!(error instanceof UserFeedbackError)) {
        this._faroService.trackError(error, context);
      }
    } catch (faroError) {
      // Silently fail - don't let Faro issues break error handling
      console.error('Failed to send error to Faro:', faroError);
    }
  }

  private sendErrorToSentry(error: any) {
    Sentry.captureException(error);
  }
}
```

**Error Categorization**:
- **Network errors** (400, 403, 404, 504): Track with HTTP status
- **DSP-API errors** (ApiResponseError): Tag as API errors
- **JS runtime errors**: Track with stack trace
- **User feedback errors**: Don't send to Faro (expected behavior)

### 4.4 Custom Event Tracking

**Add throughout application**:

**Resource Operations**:
```typescript
// In resource creation
this.faroService.trackEvent('resource.created', {
  resourceType: 'StillImageRepresentation',
  projectUuid: this.projectUuid,
  duration: Date.now() - startTime,
});

// In resource update
this.faroService.trackEvent('resource.updated', {
  resourceIri: this.resource.id,
  propertyType: 'hasValue',
  duration: Date.now() - startTime,
});
```

**Search Operations**:
```typescript
this.faroService.trackEvent('search.performed', {
  searchType: 'fulltext',
  query: searchTerm,
  resultCount: results.length,
  duration: Date.now() - startTime,
});
```

**Ontology Operations**:
```typescript
this.faroService.trackEvent('ontology.property.created', {
  ontologyIri: this.ontologyIri,
  propertyType: 'TextValue',
  duration: Date.now() - startTime,
});
```

**IIIF Viewer**:
```typescript
this.faroService.trackEvent('iiif.image.loaded', {
  imageUrl: this.imageUrl,
  loadTime: Date.now() - startTime,
  zoomLevel: viewer.viewport.getZoom(),
});
```

**Authentication**:
```typescript
this.faroService.trackEvent('auth.login', {
  method: 'password',
  success: true,
});

this.faroService.trackEvent('auth.logout', {
  reason: 'user_initiated',
});
```

---

## Phase 5: Local Development Setup

### 5.1 Docker Compose Setup

**Create**: `docker-compose.faro-local.yml`

```yaml
version: '3.8'

services:
  # Grafana Faro Collector
  faro-collector:
    image: grafana/faro-collector:latest
    ports:
      - "12345:12345"
    environment:
      - FARO_RECEIVER_CORS_ALLOWED_ORIGINS=http://localhost:4200
    volumes:
      - ./faro-data:/data
    networks:
      - faro-net

  # Grafana for visualization
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - faro-net
    depends_on:
      - loki
      - tempo

  # Loki for logs
  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - loki-data:/loki
    networks:
      - faro-net

  # Tempo for traces
  tempo:
    image: grafana/tempo:latest
    ports:
      - "3200:3200"
      - "4317:4317"
    volumes:
      - tempo-data:/tmp/tempo
    networks:
      - faro-net

  # Mimir for metrics (optional)
  mimir:
    image: grafana/mimir:latest
    ports:
      - "9009:9009"
    volumes:
      - mimir-data:/data
    networks:
      - faro-net

networks:
  faro-net:
    driver: bridge

volumes:
  grafana-data:
  loki-data:
  tempo-data:
  mimir-data:
```

**Usage**:
```bash
# Start all services
docker compose -f docker-compose.faro-local.yml up -d

# Check logs
docker compose -f docker-compose.faro-local.yml logs -f faro-collector

# Stop services
docker compose -f docker-compose.faro-local.yml down

# Clean up (including data)
docker compose -f docker-compose.faro-local.yml down -v
```

### 5.2 Local Configuration

**Create**: `apps/dsp-app/src/config/config.dev-faro.json`

```json
{
  "dspRelease": "work.in.progress",
  "apiProtocol": "http",
  "apiHost": "0.0.0.0",
  "apiPort": 3333,
  "apiPath": "",
  "iiifProtocol": "http",
  "iiifHost": "0.0.0.0",
  "iiifPort": 1024,
  "iiifPath": "",
  "ingestUrl": "http://0.0.0.0:3340",
  "geonameToken": "knora",
  "jsonWebToken": "",
  "logErrors": true,
  "iriBase": "http://rdfh.ch",
  "instrumentation": {
    "environment": "local-dev-faro",
    "rollbar": {
      "enabled": false,
      "accessToken": ""
    },
    "faro": {
      "enabled": true,
      "collectorUrl": "http://localhost:12345/collect",
      "appName": "dsp-app-local",
      "appVersion": "12.0.1-dev",
      "sessionTracking": {
        "enabled": true,
        "persistent": false,
        "samplingRate": 1.0
      },
      "instrumentations": {
        "console": {
          "enabled": true,
          "disabledLevels": []
        },
        "errors": true,
        "webVitals": true,
        "interactions": true,
        "performance": true
      },
      "beforeSend": {
        "maskSensitiveData": false,
        "excludeUrls": []
      },
      "batching": {
        "enabled": false,
        "sendTimeout": 250
      }
    }
  },
  "featureFlags": {
    "allowEraseProjects": true
  }
}
```

**Add environment configuration**:

**File**: `apps/dsp-app/src/environments/environment.faro-local.ts`

```typescript
import packageJson from '../../../../package.json';

export const environment = {
  name: 'faro-local',
  production: false,
  version: packageJson.version,
};
```

**Update**: `angular.json` configurations to add faro-local configuration

**Add npm script** to `package.json`:
```json
{
  "scripts": {
    "start-faro-local": "nx run dsp-app:serve --configuration=faro-local"
  }
}
```

### 5.3 Development Workflow

**Setup Steps**:
1. Start Faro stack:
   ```bash
   docker compose -f docker-compose.faro-local.yml up -d
   ```

2. Wait for services to be healthy (~30 seconds):
   ```bash
   docker compose -f docker-compose.faro-local.yml ps
   ```

3. Start Angular app:
   ```bash
   npm run start-faro-local
   ```

4. Access services:
   - Angular app: http://localhost:4200
   - Grafana dashboard: http://localhost:3000 (admin/admin)
   - Faro collector: http://localhost:12345

**Testing Workflow**:
1. Open browser to http://localhost:4200
2. Open browser DevTools → Network tab
3. Navigate through app to generate events
4. Look for POST requests to `http://localhost:12345/collect`
5. View real-time data in Grafana at http://localhost:3000
6. Trigger errors intentionally to test error tracking:
   - Navigate to non-existent resource
   - Make invalid API calls
   - Throw test errors in console

**Grafana Dashboard Access**:
1. Go to http://localhost:3000
2. Login: admin / admin
3. Navigate to Explore
4. Select Loki data source
5. Query logs: `{app="dsp-app-local"}`
6. Select Tempo data source
7. View traces and spans

### 5.4 Mock Collector Alternative (Lightweight)

**For developers without Docker or for faster testing**

**Create**: `tools/faro-mock-collector.js`

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 12345;
const LOG_FILE = path.join(__dirname, '../faro-mock-collector.log');

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/collect') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const timestamp = new Date().toISOString();

        // Log to console
        console.log(`[${timestamp}] Received Faro payload:`);
        console.log(JSON.stringify(payload, null, 2));
        console.log('---');

        // Log to file
        fs.appendFileSync(LOG_FILE,
          `[${timestamp}]\n${JSON.stringify(payload, null, 2)}\n\n`
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        console.error('Error parsing payload:', error);
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Faro Mock Collector running on http://localhost:${PORT}`);
  console.log(`Logging to: ${LOG_FILE}`);
  console.log('Press Ctrl+C to stop');
});
```

**Add npm script**:
```json
{
  "scripts": {
    "faro-mock-collector": "node tools/faro-mock-collector.js"
  }
}
```

**Usage**:
```bash
# Terminal 1: Start mock collector
npm run faro-mock-collector

# Terminal 2: Start Angular app
npm run start-faro-local
```

**Benefits**:
- No Docker required
- Instant startup
- Simple debugging
- File logging for later analysis
- Validates payload structure

---

## Phase 6: Grafana Cloud Setup (Production Path)

### 6.1 Create Grafana Cloud Account

**Steps**:
1. Sign up at https://grafana.com/auth/sign-up/create-user
2. Choose plan:
   - **Free tier**: 50GB logs, 50GB traces, 10K series (good for testing)
   - **Pro tier**: ~$30-100/month depending on usage (recommended for production)
3. Create organization
4. Set up billing (if using Pro tier)

### 6.2 Create Frontend Observability Application

**Steps**:
1. Navigate to **Applications** → **Frontend Observability**
2. Click **Create Application**
3. Configure application:
   - **Name**: `dsp-app-production`
   - **Framework**: Web (JavaScript)
   - **Description**: DSP-APP Frontend Observability
4. Configure CORS:
   - Add allowed origins:
     - `https://app.dasch.swiss` (production)
     - `https://stage.dasch.swiss` (staging)
     - `https://dev.dasch.swiss` (dev server)
5. Copy the generated:
   - **Collector URL**: `https://faro-collector-[region].grafana.net/collect`
   - **App Key**: (embedded in URL or separate)

### 6.3 Environment-Specific Endpoints

**Configuration Strategy**:

| Environment | Grafana Cloud App | Purpose | Sampling |
|-------------|-------------------|---------|----------|
| **dev-server** | `dsp-app-dev` | Development testing | 100% sessions |
| **ls-test-server** | `dsp-app-test` | QA testing | 100% sessions |
| **stage-server** | `dsp-app-stage` | Pre-production testing | 50% sessions |
| **production** | `dsp-app-production` | Live users | 10% sessions, 100% errors |

**Collector URL Format**:
```
https://faro-collector-us-central-0.grafana.net/collect/{app-key}
```
or
```
https://faro-collector-eu-west-0.grafana.net/collect/{app-key}
```

**Region Selection**:
- Choose region closest to primary user base
- EU users → EU region (GDPR compliance)
- US users → US region (lower latency)

### 6.4 Update Config Files

**File**: `apps/dsp-app/src/config/config.prod.json`

```json
{
  "instrumentation": {
    "environment": "prod",
    "faro": {
      "enabled": true,
      "collectorUrl": "https://faro-collector-eu-west-0.grafana.net/collect/{PROD_APP_KEY}",
      "appName": "dsp-app",
      "appVersion": "12.0.1",
      "sessionTracking": {
        "enabled": true,
        "persistent": true,
        "samplingRate": 0.1
      },
      "instrumentations": {
        "console": {
          "enabled": true,
          "disabledLevels": ["log", "info", "debug"]
        },
        "errors": true,
        "webVitals": true,
        "interactions": true,
        "performance": true
      },
      "beforeSend": {
        "maskSensitiveData": true,
        "excludeUrls": ["/assets/", "/config/"]
      },
      "batching": {
        "enabled": true,
        "sendTimeout": 250
      }
    }
  }
}
```

**File**: `apps/dsp-app/src/config/config.stage-server.json`

```json
{
  "instrumentation": {
    "environment": "stage",
    "faro": {
      "enabled": true,
      "collectorUrl": "https://faro-collector-eu-west-0.grafana.net/collect/{STAGE_APP_KEY}",
      "sessionTracking": {
        "samplingRate": 0.5
      },
      "instrumentations": {
        "console": {
          "disabledLevels": ["log", "debug"]
        }
      }
    }
  }
}
```

### 6.5 Data Retention and Sampling

**Grafana Cloud Retention Policies**:
- **Free tier**: 14-30 days
- **Pro tier**: 30-90 days (configurable)
- **Enterprise**: Custom retention

**Recommended Settings**:

| Environment | Retention | Session Sampling | Error Sampling | Console Logs |
|-------------|-----------|------------------|----------------|--------------|
| **dev** | 30 days | 100% | 100% | All levels |
| **test** | 30 days | 100% | 100% | warn, error |
| **stage** | 60 days | 50% | 100% | warn, error |
| **prod** | 90 days | 10% | 100% | error only |

**Why 10% session sampling in production?**
- Reduces costs significantly
- Still captures ~1000 sessions/month for 10K MAU
- 100% error sampling ensures no errors are missed
- Performance metrics are aggregated (not per-session)

**Data Compression**:
- Grafana Cloud automatically compresses data
- Uses efficient storage formats (Loki chunks, Tempo blocks)
- Aggregates metrics to reduce cardinality

### 6.6 Set Up Alerts

**Key Alerts to Configure**:

1. **Error Rate Spike**:
   - Trigger: Error count > 10x normal rate
   - Window: 5 minutes
   - Action: Notify Slack/email

2. **Performance Degradation**:
   - Trigger: LCP > 2.5s for >25% of sessions
   - Window: 15 minutes
   - Action: Notify team

3. **Collector Unreachable**:
   - Trigger: No events received for >10 minutes
   - Action: Notify DevOps

4. **High Error Volume**:
   - Trigger: >100 errors/hour
   - Action: Create incident ticket

**Grafana Alerting Setup**:
1. Navigate to **Alerting** → **Alert Rules**
2. Click **New Alert Rule**
3. Configure query (PromQL or LogQL)
4. Set thresholds
5. Configure notification channels (Slack, email, PagerDuty)

---

## Phase 7: Testing Strategy

### 7.1 Unit Tests

**Test Coverage For**:

**FaroAnalyticsService**:
```typescript
describe('FaroAnalyticsService', () => {
  it('should not initialize when disabled in config', () => {
    // Test with enabled: false
  });

  it('should initialize with correct configuration', () => {
    // Verify initializeFaro called with correct params
  });

  it('should hash user IRI with UUID v5', () => {
    // Test hashUserIri method
  });

  it('should track custom events', () => {
    // Verify pushEvent called
  });

  it('should track errors with context', () => {
    // Verify pushError called with context
  });

  it('should handle initialization failure gracefully', () => {
    // Test error handling
  });

  it('should update session on user login', () => {
    // Test user tracking
  });

  it('should remove user on logout', () => {
    // Test user removal
  });
});
```

**AppErrorHandler Integration**:
```typescript
describe('AppErrorHandler with Faro', () => {
  it('should send errors to both Sentry and Faro', () => {
    // Verify both services called
  });

  it('should not send UserFeedbackError to Faro', () => {
    // Verify filtering
  });

  it('should include error context in Faro', () => {
    // Verify context data
  });

  it('should not break if Faro fails', () => {
    // Test graceful degradation
  });
});
```

**Mock Strategy**:
```typescript
// Mock Faro SDK
jest.mock('@grafana/faro-web-sdk', () => ({
  initializeFaro: jest.fn(() => ({
    api: {
      pushEvent: jest.fn(),
      pushError: jest.fn(),
      setUser: jest.fn(),
    },
  })),
  getWebInstrumentations: jest.fn(() => []),
}));
```

### 7.2 Integration Tests

**Test Scenarios**:

1. **Initialization Flow**:
   - Config loaded → Faro initialized → User tracking set up
   - Verify order of operations
   - Test with different environment configs

2. **Event Tracking End-to-End**:
   - Trigger resource creation → Verify event sent
   - Trigger search → Verify event sent
   - Navigate pages → Verify page view events

3. **Error Reporting**:
   - Throw error → Verify sent to Faro
   - Network error → Verify HTTP context included
   - API error → Verify API details included

4. **Session Management**:
   - Login → Verify user set
   - Logout → Verify user removed
   - Session expiry → Verify user removed

5. **Sampling**:
   - Test with different sampling rates
   - Verify events sent/not sent according to rate

**Integration Test Example**:
```typescript
describe('Faro Integration', () => {
  it('should track resource creation event', () => {
    // Setup
    const faroService = TestBed.inject(FaroAnalyticsService);
    const spy = jest.spyOn(faroService, 'trackEvent');

    // Create resource
    component.createResource();
    fixture.detectChanges();

    // Verify
    expect(spy).toHaveBeenCalledWith('resource.created', {
      resourceType: 'StillImageRepresentation',
      projectUuid: expect.any(String),
      duration: expect.any(Number),
    });
  });
});
```

### 7.3 E2E Tests with Faro

**Considerations**:
- Faro should not interfere with Cypress test stability
- Two approaches:

**Approach 1: Disable Faro in E2E Tests**
- Create separate config: `config.e2e.json` with `faro.enabled: false`
- Cleaner test output
- No external dependencies
- Recommended for most tests

**Approach 2: Use Faro with Mock Collector**
- Point to mock collector in E2E config
- Validate Faro integration in E2E
- Test that events are actually sent
- Use for specific Faro validation tests

**Cypress Configuration**:
```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    env: {
      configFile: 'config.e2e.json',
    },
  },
});
```

**E2E Test Example**:
```typescript
describe('Resource Creation (with Faro)', () => {
  it('should send Faro event on successful creation', () => {
    // Intercept Faro collector
    cy.intercept('POST', '**/collect', (req) => {
      const payload = req.body;
      expect(payload.events).to.include.something.that.deep.includes({
        name: 'resource.created',
      });
      req.reply({ status: 'ok' });
    }).as('faroEvent');

    // Perform action
    cy.visit('/resource/new');
    cy.get('[data-cy=create-resource-btn]').click();

    // Wait for Faro event
    cy.wait('@faroEvent');
  });
});
```

### 7.4 Performance Testing

**Measure**:
1. **Bundle Size Impact**:
   ```bash
   npm run build-prod
   ls -lh dist/apps/dsp-app/main.*.js
   ```
   - Before Faro: Record size
   - After Faro: Should be +30-40KB gzipped

2. **Initialization Time**:
   - Use Chrome DevTools Performance tab
   - Measure time from `initializeFaro()` call to completion
   - Should be <50ms

3. **Runtime Overhead**:
   - Profile with Chrome DevTools
   - Faro should use <1% of JavaScript execution time
   - No noticeable UI lag

4. **Network Bandwidth**:
   - Monitor Network tab
   - Events should be batched (not sent individually)
   - Typical session: ~10KB compressed data

**Performance Benchmarks**:
```typescript
describe('Faro Performance', () => {
  it('should initialize in less than 50ms', async () => {
    const start = performance.now();
    await faroService.setup();
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('should track events with minimal overhead', () => {
    const iterations = 1000;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      faroService.trackEvent('test.event', { index: i });
    }

    const duration = performance.now() - start;
    const avgTime = duration / iterations;
    expect(avgTime).toBeLessThan(1); // <1ms per event
  });
});
```

---

## Phase 8: Deployment and Rollout

### 8.1 Phased Rollout Strategy

**Phase 1: Internal Testing** (Week 1-2)
- **Environment**: dev-server only
- **Audience**: Development team (5-10 users)
- **Sampling**: 100% sessions, all console logs
- **Goals**:
  - Validate Faro initialization
  - Test event tracking across all features
  - Verify dashboard setup
  - Identify and fix any issues
- **Success Criteria**:
  - Zero app-breaking errors
  - All custom events appearing in Grafana
  - Performance overhead <1%
  - Team comfortable with dashboards

**Phase 2: QA/Staging** (Week 3)
- **Environment**: ls-test-server and stage-server
- **Audience**: QA team + internal users (20-50 users)
- **Sampling**: 100% sessions on test, 50% on stage
- **Goals**:
  - Internal QA testing with Faro enabled
  - Performance impact assessment
  - Validate no conflicts with Sentry
  - Test with realistic usage patterns
- **Success Criteria**:
  - All E2E tests passing
  - No performance degradation
  - Successful error tracking
  - Dashboards provide useful insights

**Phase 3: Production Canary** (Week 4)
- **Environment**: production
- **Audience**: 10% of production users (canary group)
- **Sampling**: 10% of canary group sessions
- **Implementation**: Use feature flag or user cohort
- **Goals**:
  - Monitor for production errors
  - Validate production collector connectivity
  - Assess real-world performance impact
  - A/B test with Sentry-only group
- **Success Criteria**:
  - Zero production incidents
  - Error rates match Sentry data
  - Performance metrics within acceptable range
  - No user complaints
- **Rollback Plan**:
  - Disable Faro via feature flag
  - Redeploy without Faro if critical issue
  - Switch to Sentry-only temporarily

**Phase 4: Full Production Rollout** (Week 5+)
- **Environment**: production
- **Audience**: 100% of users
- **Sampling**: 10% sessions, 100% errors
- **Goals**:
  - Enable Faro for all users
  - Replace/supplement Sentry based on evaluation
  - Train team on Grafana dashboards
  - Establish monitoring practices
- **Success Criteria**:
  - Stable production deployment
  - Team using Grafana for debugging
  - Cost within budget
  - Positive ROI on observability

### 8.2 Feature Flag Implementation

**Add to config files**:
```json
{
  "featureFlags": {
    "allowEraseProjects": true,
    "enableFaro": true,
    "faroSampleRate": 1.0,
    "faroUserCohort": "all"
  }
}
```

**Feature Flag Options**:
- `enableFaro`: Master toggle (boolean)
- `faroSampleRate`: Override session sampling (0.0 - 1.0)
- `faroUserCohort`: "all", "canary", "beta" (future: user segments)

**Runtime Toggle**:
- Allow disabling Faro without redeployment
- Use runtime config service or feature flag service
- Useful for emergency rollback

**Implementation**:
```typescript
// In FaroAnalyticsService
setup(): void {
  const featureFlags = this._appConfig.featureFlags;

  if (!this.config?.enabled || !featureFlags?.enableFaro) {
    return;
  }

  // Override sampling rate if specified
  const samplingRate = featureFlags.faroSampleRate ??
                       this.config.sessionTracking.samplingRate;

  // Initialize with runtime config
  this.faroInstance = initializeFaro({
    // ... config
    sessionTracking: {
      samplingRate,
    },
  });
}
```

### 8.3 Monitoring the Monitoring

**Key Metrics to Track**:

1. **Faro Initialization Success Rate**:
   - Target: >99.9%
   - Query: Count successful vs failed initializations
   - Alert: If <99% success

2. **Bundle Size Impact**:
   - Baseline: Current production bundle
   - After Faro: Should be +30-40KB gzipped
   - Monitor: Core Web Vitals (LCP, FCP) don't degrade

3. **Performance Overhead**:
   - JavaScript execution time: <1% increase
   - Memory usage: +2-5MB acceptable
   - FPS: No degradation in UI smoothness
   - Monitor: Chrome User Experience Report data

4. **Collector Availability**:
   - Target: >99.9% uptime
   - Query: Failed collector requests vs successful
   - Alert: If >1% failure rate

5. **Data Loss Rate**:
   - Events queued but not sent (network issues)
   - Target: <0.1% data loss
   - Use IndexedDB queue for resilience

**Grafana Dashboard: "Faro System Health"**:
```
- Initialization Success Rate (gauge)
- Events Sent (graph over time)
- Failed Events (graph over time)
- Collector Response Time (graph)
- Session Sampling Rate (current value)
- Data Volume Ingested (bytes/day)
- Cost Estimate (based on ingestion)
```

**Alerts to Set Up**:

1. **Faro Collector Unreachable**:
   - Condition: No events received for >10 minutes
   - Severity: High
   - Action: Page on-call engineer

2. **Error Rate Spike**:
   - Condition: Error count >10x normal (baseline: 7-day avg)
   - Window: 5 minutes
   - Severity: High
   - Action: Notify team Slack channel

3. **Performance Degradation**:
   - Condition: LCP >2.5s for >25% of sessions
   - Window: 15 minutes
   - Severity: Medium
   - Action: Notify team

4. **High Data Ingestion Cost**:
   - Condition: Daily ingestion >2x expected
   - Severity: Medium
   - Action: Notify team to investigate

5. **Initialization Failure Rate**:
   - Condition: >1% initialization failures
   - Window: 1 hour
   - Severity: High
   - Action: Investigate immediately

### 8.4 Deployment Checklist

**Pre-Deployment**:
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing (with Faro enabled)
- [ ] Performance benchmarks within acceptable range
- [ ] Grafana Cloud account set up
- [ ] Collector URLs configured for all environments
- [ ] Dashboards created and tested
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on dashboards

**Deployment**:
- [ ] Deploy to dev-server first
- [ ] Verify events appearing in Grafana
- [ ] Test all critical user journeys
- [ ] Deploy to stage-server
- [ ] Run full regression testing
- [ ] Deploy to production (canary)
- [ ] Monitor for 24-48 hours
- [ ] Gradually increase rollout

**Post-Deployment**:
- [ ] Monitor error rates
- [ ] Monitor performance metrics
- [ ] Review dashboards daily for first week
- [ ] Collect team feedback
- [ ] Document any issues and resolutions
- [ ] Plan next iteration improvements

---

## Phase 9: Grafana Dashboard Setup

### 9.1 Pre-built Dashboards

**Install from Grafana Marketplace**:

1. **Faro Web SDK Overview**:
   - Dashboard ID: (check Grafana marketplace)
   - Metrics: Sessions, page views, errors, Web Vitals
   - Filters: Environment, version, user agent

2. **Faro Error Analytics**:
   - Top errors by frequency
   - Error trends over time
   - Affected users count
   - Error distribution by browser/device

3. **Faro Performance**:
   - Web Vitals breakdown (LCP, FID/INP, CLS)
   - Resource timing
   - Navigation timing
   - Long tasks

4. **Faro User Journey**:
   - Session timeline visualization
   - Navigation flow (Sankey diagram)
   - User actions sequence
   - Session replay links

**Installation Steps**:
1. Navigate to **Dashboards** → **Import**
2. Enter dashboard ID or upload JSON
3. Select data sources (Loki, Tempo, Mimir)
4. Customize variables (environment, version)
5. Save to folder (e.g., "Frontend Observability")

### 9.2 Custom Dashboards for DSP

**Create Domain-Specific Dashboards**:

#### Dashboard 1: "DSP Resource Operations"
**Panels**:
- Resource creation rate (events/hour)
- Resource creation duration (P50, P95, P99)
- Failed resource operations (by type)
- Top resource types being created
- Resource operations by project

**Queries** (PromQL):
```promql
# Resource creation rate
rate(faro_custom_event_total{event_name="resource.created"}[5m])

# Resource creation duration P95
histogram_quantile(0.95,
  rate(faro_custom_event_duration_bucket{event_name="resource.created"}[5m])
)

# Failed resource operations
sum by (error_type) (
  rate(faro_error_total{context_operation=~"resource.*"}[5m])
)
```

#### Dashboard 2: "DSP Search Performance"
**Panels**:
- Search queries/hour
- Search duration by type (fulltext, advanced, gravsearch)
- Search result counts distribution
- Failed searches
- Popular search terms (top 10)

**Queries** (LogQL for Loki):
```logql
# Search queries per hour
sum(rate({app="dsp-app"} |= "search.performed" [1h]))

# Search duration by type
quantile_over_time(0.95,
  {app="dsp-app"} |= "search.performed"
  | json
  | unwrap duration [5m]
) by (searchType)

# Failed searches
sum by (error_message) (
  rate({app="dsp-app"} |= "search.failed" [5m])
)
```

#### Dashboard 3: "DSP Ontology Editor"
**Panels**:
- Ontology operations/hour (create, update, delete)
- Operation duration
- Top ontologies being edited
- Failed ontology operations
- Property creation by type

#### Dashboard 4: "DSP IIIF Viewer Performance"
**Panels**:
- Image load times
- Zoom interactions/session
- Failed image loads
- IIIF server errors
- Average images viewed/session

#### Dashboard 5: "DSP User Activity"
**Panels**:
- Active users (by hour, day, week)
- Sessions per user
- Session duration distribution
- Top projects by activity
- User actions heatmap (by time of day)
- Geographic distribution (if available)

#### Dashboard 6: "DSP Error Analytics"
**Panels**:
- Error rate over time
- Top errors (by message)
- Errors by component/page
- Errors by environment (dev, stage, prod)
- Affected users count
- Error resolution status (new, investigating, resolved)

### 9.3 Correlation Dashboards (Backend Integration)

**Prerequisites**: DSP-API must be instrumented with OpenTelemetry

**Dashboard: "End-to-End Request Tracking"**
**Panels**:
- Frontend request → Backend trace correlation
- Full request latency breakdown:
  - Frontend JS execution
  - Network time
  - Backend processing
  - Database queries
- Error attribution (frontend vs backend)
- Slowest API endpoints from frontend perspective

**Trace Correlation**:
```typescript
// In Faro setup, enable tracing
import { FaroTraceExporter } from '@grafana/faro-web-tracing';

initializeFaro({
  // ... other config
  instrumentations: [
    ...getWebInstrumentations(),
    new TracingInstrumentation({
      exporter: new FaroTraceExporter(),
    }),
  ],
});
```

**Backend Instrumentation** (DSP-API - separate effort):
- Add OpenTelemetry SDK
- Propagate trace context from frontend
- Export traces to Grafana Tempo
- Correlate via trace ID

**Correlation Query** (TraceQL):
```traceql
# Find traces that include both frontend and backend spans
{span.app="dsp-app"} && {span.app="dsp-api"}

# Find slow requests (>2s total)
{span.app="dsp-app"} | duration > 2s

# Find requests with errors
{span.app="dsp-app"} && {span.error=true}
```

### 9.4 Dashboard Best Practices

**Organization**:
- Use folders: "Frontend Observability", "Backend", "Business Metrics"
- Tag dashboards: "faro", "dsp-app", "production"
- Use consistent naming: "[DSP] Dashboard Name"

**Variables**:
- Environment (dev, stage, prod)
- Time range (last 1h, 6h, 24h, 7d)
- Version (for comparing releases)
- Project UUID (for project-specific analysis)

**Annotations**:
- Mark deployments on timeline
- Mark incidents
- Mark configuration changes

**Alerting**:
- Link dashboards to alert rules
- Add links to runbooks from panels
- Include SLO targets on panels

**Performance**:
- Limit time range for heavy queries
- Use recording rules for expensive queries
- Cache dashboard JSON in Git for version control

---

## Phase 10: Documentation and Training

### 10.1 Developer Documentation

**Create**: `docs/developers/faro-integration.md`

**Sections**:

1. **Overview**:
   - What is Grafana Faro?
   - Why we're using it
   - Architecture diagram

2. **Local Development**:
   - Docker setup instructions
   - Mock collector setup
   - Configuration options
   - Troubleshooting common issues

3. **Adding Custom Events**:
   - When to add custom events
   - Event naming conventions
   - Code examples
   - Best practices (don't track PII)

4. **Testing**:
   - Unit testing with Faro mocks
   - Integration testing
   - E2E testing considerations

5. **Configuration**:
   - Environment-specific configs
   - Feature flags
   - Sampling strategies

6. **Debugging**:
   - How to check if Faro is initialized
   - Viewing events in Network tab
   - Common errors and solutions

**Code Examples**:
```typescript
// Good: Track meaningful business events
this.faroService.trackEvent('resource.created', {
  resourceType: 'StillImageRepresentation',
  projectUuid: this.projectUuid,
  duration: performance.now() - startTime,
});

// Bad: Don't track too frequently
this.faroService.trackEvent('mousemove', { x, y }); // NO!

// Bad: Don't include PII
this.faroService.trackEvent('user.updated', {
  email: user.email, // NO! Use hashed ID instead
});

// Good: Include context for debugging
this.faroService.trackError(error, {
  component: 'ResourceEditorComponent',
  action: 'saveProperty',
  resourceIri: this.resource.id,
});
```

### 10.2 Dashboard User Guide

**Create**: `docs/user-guide/grafana-dashboards.md`

**Audience**: Product managers, support team, non-technical users

**Sections**:

1. **Getting Started**:
   - How to access Grafana
   - Login credentials (or SSO)
   - Basic navigation

2. **Key Dashboards**:
   - DSP Overview: High-level metrics
   - Error Analytics: Investigating errors
   - Performance: Monitoring speed
   - User Activity: Understanding usage

3. **Common Workflows**:
   - Investigating a user-reported error
   - Analyzing performance degradation
   - Understanding feature usage
   - Comparing before/after deployment

4. **Creating Custom Queries**:
   - Using Explore mode
   - LogQL basics for searching logs
   - PromQL basics for metrics
   - TraceQL for traces

5. **Exporting Data**:
   - Downloading CSV
   - Sharing dashboard links
   - Creating reports

**Screenshots**:
- Annotate key dashboard elements
- Show filter interactions
- Highlight important metrics

### 10.3 Runbooks

**Create Runbooks for**:

#### Runbook 1: "Faro Collector Outage"
**Symptoms**:
- No events in Grafana for >10 minutes
- Alert: "Faro Collector Unreachable"

**Diagnosis**:
1. Check Grafana Cloud status page
2. Test collector endpoint: `curl -X POST <collector-url>/collect`
3. Check browser Network tab for failed requests
4. Check Faro initialization in browser console

**Resolution**:
1. If Grafana Cloud issue: Wait for resolution
2. If app configuration issue: Fix config and redeploy
3. If network issue: Check firewall/CORS settings
4. Temporary mitigation: Faro will queue events in IndexedDB

**Escalation**:
- Contact Grafana Cloud support if their outage
- Contact DevOps if infrastructure issue

#### Runbook 2: "High Error Rate Investigation"
**Symptoms**:
- Alert: "Error rate >10x normal"
- Users reporting issues

**Diagnosis**:
1. Go to DSP Error Analytics dashboard
2. Filter by time range (last hour)
3. Identify top error messages
4. Check affected user count
5. Correlate with recent deployments

**Investigation Steps**:
1. Click on error to see details
2. View session timeline for affected users
3. Check if error is frontend or backend
4. Review recent code changes
5. Check if specific to browser/device

**Resolution**:
1. If critical: Rollback deployment
2. If minor: Create bug ticket
3. If configuration: Fix config
4. Communicate to users if needed

#### Runbook 3: "Performance Degradation Analysis"
**Symptoms**:
- Alert: "LCP >2.5s for >25% sessions"
- Users reporting slow app

**Diagnosis**:
1. Go to DSP Performance dashboard
2. Check Web Vitals trends
3. Identify which pages are slow
4. Look for resource timing issues
5. Check for JavaScript long tasks

**Investigation Steps**:
1. Compare current vs baseline (7-day avg)
2. Check if specific to certain users/browsers
3. Review recent deployments
4. Check backend API response times
5. Look for large bundle size increase

**Resolution**:
1. Optimize heavy resources
2. Lazy load components
3. Add caching
4. Profile in Chrome DevTools
5. Create performance improvement ticket

#### Runbook 4: "User Session Debugging"
**Use Case**: Support ticket - "User X can't do Y"

**Steps**:
1. Get user's hashed ID or time frame
2. Go to Grafana → Explore
3. Query Loki:
   ```logql
   {app="dsp-app", userId="<hashed-id>"}
   ```
4. Filter to relevant time window
5. View session timeline
6. Identify errors or unexpected behavior
7. Correlate with backend logs (if available)
8. Document findings in ticket

### 10.4 Team Training

**Training Session 1: "Grafana Faro Overview"** (1 hour)
- What is Faro and why we're using it
- Live demo of dashboards
- How to access Grafana
- Key metrics to monitor
- Q&A

**Training Session 2: "Debugging with Faro"** (1 hour)
- Investigating errors with Faro
- Session replay and timeline
- Correlating frontend and backend
- Hands-on exercises
- Best practices

**Training Session 3: "Advanced Grafana"** (1 hour)
- Writing custom queries
- Creating custom dashboards
- Setting up alerts
- Exporting data and reports

**Training Materials**:
- Record sessions for future reference
- Create cheat sheets (common queries)
- Set up #grafana Slack channel for questions
- Schedule office hours for ongoing support

---

## Phase 11: Cost and Performance Considerations

### 11.1 Bundle Size Impact

**Current State**:
- Main bundle (estimated): ~2-3MB uncompressed
- Gzipped: ~500-800KB

**After Faro**:
- `@grafana/faro-web-sdk`: ~30KB gzipped (~100KB uncompressed)
- `@grafana/faro-web-tracing`: ~10KB gzipped (~30KB uncompressed)
- **Total addition**: ~40KB gzipped (~130KB uncompressed)

**Relative Impact**:
- ~5-8% increase in gzipped bundle
- ~4-6% increase in uncompressed bundle

**Mitigation Strategies**:

1. **Lazy Loading** (Recommended):
   ```typescript
   // Load Faro after app bootstrap
   export function faroInitializer(): () => Promise<void> {
     return async () => {
       const { initializeFaro, getWebInstrumentations } =
         await import('@grafana/faro-web-sdk');

       initializeFaro({...});
     };
   }
   ```
   - Benefit: Doesn't block initial load
   - Main bundle stays smaller
   - Faro loads in background

2. **Tree Shaking**:
   - Import only needed instrumentations
   - Don't import unused Faro packages
   - Verify with webpack-bundle-analyzer

3. **Upgrade to Faro v2**:
   - Smaller bundle (removed deprecated code)
   - Better tree shaking support
   - More efficient instrumentation

**Monitor**:
- Use Lighthouse CI in build pipeline
- Alert if bundle size increases >10%
- Track Core Web Vitals (especially FCP, LCP)

### 11.2 Runtime Performance

**Expected Overhead**:

| Metric | Impact | Acceptable Range |
|--------|--------|------------------|
| Initialization time | <50ms | <100ms |
| Per-event overhead | <1ms | <5ms |
| Network requests | +5-10/session | <20/session |
| Memory footprint | +2-5MB | <10MB |
| CPU (JavaScript execution) | <1% | <2% |

**Performance Best Practices**:

1. **Batch Events**:
   ```typescript
   // Faro automatically batches, but configure:
   batching: {
     enabled: true,
     sendTimeout: 250, // Send batch every 250ms
   }
   ```

2. **Sample High-Frequency Events**:
   ```typescript
   // Don't track every interaction
   trackInteraction(event: string) {
     if (Math.random() < 0.1) { // 10% sampling
       this.faroService.trackEvent(event);
     }
   }
   ```

3. **Filter Noisy Console Logs**:
   ```typescript
   // Production config
   console: {
     enabled: true,
     disabledLevels: ['log', 'info', 'debug'], // Only warn and error
   }
   ```

4. **Debounce Frequent Events**:
   ```typescript
   // For scroll, resize, etc.
   @HostListener('scroll', ['$event'])
   @debounce(1000)
   onScroll(event: Event) {
     this.faroService.trackEvent('scroll', {...});
   }
   ```

**Performance Monitoring**:

1. **Real User Monitoring**:
   - Monitor Web Vitals before and after Faro
   - Ensure no degradation in LCP, FID/INP, CLS
   - Use Chrome User Experience Report

2. **Synthetic Monitoring**:
   - Lighthouse CI in pipeline
   - WebPageTest before/after comparison
   - Set performance budgets

3. **Production Monitoring**:
   - Create dashboard: "Faro Performance Impact"
   - Metrics:
     - JavaScript execution time (Faro vs total)
     - Long tasks caused by Faro
     - Memory heap size
     - Network requests

**Performance Benchmarks**:
```typescript
// Add to E2E tests
it('should not impact page load performance', () => {
  cy.visit('/');

  // Measure First Contentful Paint
  cy.window().then((win) => {
    const perfData = win.performance.getEntriesByType('paint');
    const fcp = perfData.find(e => e.name === 'first-contentful-paint');

    // FCP should be <1.8s (good) even with Faro
    expect(fcp.startTime).to.be.lessThan(1800);
  });
});
```

### 11.3 Grafana Cloud Costs

**Pricing Model** (as of 2025):
- Based on **data ingestion volume** (logs, traces, metrics)
- Based on **active series** (metrics cardinality)
- Based on **trace spans**
- Tiered pricing (free, pro, advanced, enterprise)

**Free Tier Limits**:
- 50GB logs/month
- 50GB traces/month
- 10,000 series
- 14-day retention

**Pro Tier** (~$30-200/month depending on usage):
- Pay-as-you-go beyond free tier
- ~$0.50/GB logs
- ~$0.50/GB traces
- ~$0.15/1000 series
- Configurable retention (30-90 days)

**Cost Estimation for DSP-APP**:

**Assumptions**:
- 10,000 monthly active users (MAU)
- 10% session sampling = 1,000 tracked sessions/month
- Average session: 10 minutes, 20 events
- Error rate: 0.1% of sessions = 1 error/1000 sessions

**Data Volume Estimate**:
- Events per session: 20
- Payload size per event: ~500 bytes (compressed)
- Session data: 20 × 500 bytes = 10KB/session
- Monthly data: 1,000 sessions × 10KB = 10MB/month

**With 100% Sampling** (for comparison):
- 10,000 sessions × 10KB = 100MB/month

**Traces** (if enabled):
- Trace per session: ~5 spans
- Span size: ~1KB
- Monthly traces: 1,000 sessions × 5KB = 5MB/month

**Total Estimated Ingestion**:
- **10% sampling**: ~15MB/month (within free tier!)
- **100% sampling**: ~105MB/month (~$50/month)

**Cost Optimization Strategies**:

1. **Sampling**:
   - Use 10% session sampling in production
   - Keep 100% error sampling (errors are rare)
   - Adjust based on actual costs

2. **Filter Verbose Logs**:
   - Disable `console.log()` and `console.info()` in production
   - Only track `console.error()` and `console.warn()`
   - Reduces data volume by ~50%

3. **Aggregate Events Client-Side**:
   - Instead of 100 individual events, send summary
   - Example: "50 resources created in session" instead of 50 separate events

4. **Data Retention**:
   - 30 days for dev/stage (cheaper)
   - 90 days for production (compliance)
   - Archive to S3 for long-term storage (much cheaper)

5. **Use Recording Rules**:
   - Pre-aggregate metrics on Grafana side
   - Reduces query costs
   - Faster dashboard loading

**Cost Monitoring**:
- Set up Grafana Cloud billing alerts
- Monitor ingestion volume daily
- Create dashboard: "Faro Cost Tracking"
- Alert if daily ingestion >2x expected

**Budget Recommendation**:
- **Conservative** (10% sampling): $0-50/month (likely free tier)
- **Moderate** (50% sampling): $50-100/month
- **Aggressive** (100% sampling): $100-200/month

### 11.4 Return on Investment (ROI)

**Costs**:
- Grafana Cloud: $0-200/month
- Development time: ~6-8 weeks (1 developer)
- Maintenance: ~2-4 hours/month
- **Total Year 1**: ~$2,000-3,000 (dev time) + $600-2,400 (subscription) = ~$2,600-5,400

**Benefits**:
- **Faster debugging**: 50% reduction in time spent debugging production issues
  - Current: ~20 hours/month
  - After Faro: ~10 hours/month
  - Savings: 10 hours/month × $100/hour = $1,000/month = $12,000/year
- **Better user experience**: Proactive issue detection
  - Catch issues before users report them
  - Reduce support tickets by ~20%
  - Improve user satisfaction
- **Data-driven decisions**: Product team can analyze feature usage
  - Prioritize features based on actual usage data
  - A/B test with real metrics
- **Performance insights**: Identify and fix performance bottlenecks
  - Improve Core Web Vitals
  - Better SEO and user engagement

**ROI Calculation**:
- **Investment**: $2,600-5,400
- **Savings**: $12,000/year (developer time alone)
- **ROI**: ~200-400% in first year
- **Payback period**: ~2-5 months

**Intangible Benefits**:
- Improved team morale (less time on tedious debugging)
- Better product quality
- Competitive advantage (faster iteration)

---

## Phase 12: Migration from Sentry (Optional Long-term)

### 12.1 Feature Comparison

| Feature | Sentry | Grafana Faro | Winner |
|---------|--------|--------------|--------|
| Error tracking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Sentry |
| Stack traces | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Sentry |
| Source maps | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Sentry |
| Issue grouping | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Sentry |
| Release tracking | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Sentry |
| Session replay | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Tie |
| Performance (RUM) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Web Vitals | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Custom events | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Logs integration | ⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Traces integration | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Backend correlation | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Unified observability | ⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Pricing (small scale) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Faro |
| Pricing (large scale) | ⭐⭐⭐ | ⭐⭐⭐⭐ | Faro |
| Learning curve | ⭐⭐⭐⭐ | ⭐⭐⭐ | Sentry |

**Sentry Strengths**:
- **Best-in-class error tracking**: Industry standard for error monitoring
- **Excellent stack traces**: Source map support is mature and reliable
- **Issue grouping**: Smart algorithms to group related errors
- **Release tracking**: Built-in release management and comparison
- **User feedback**: In-app user feedback widget
- **Breadcrumbs**: Detailed user action trail leading to error
- **Issue management**: Assign, resolve, ignore issues
- **Integration ecosystem**: Slack, Jira, GitHub, etc.

**Faro Strengths**:
- **Unified observability**: Logs, metrics, traces in one place (Grafana ecosystem)
- **Full user session context**: Complete picture of user journey
- **Frontend-backend correlation**: With OpenTelemetry, trace requests end-to-end
- **Web Vitals**: Comprehensive Real User Monitoring
- **Custom events**: Flexible business event tracking
- **Grafana ecosystem**: Leverage existing Grafana knowledge and infrastructure
- **Cost-effective**: Generous free tier, pay-as-you-go pricing
- **Open source**: Faro is open source (transparency, community)

### 12.2 Complementary vs Replacement

**Option 1: Complement (Recommended for 6+ months)**

**Use Both**:
- **Sentry**: Error tracking, issue management, releases
- **Faro**: Performance, analytics, session context, backend correlation

**Benefits**:
- Best of both worlds
- Redundancy (if one fails, other still works)
- Gradual learning curve
- Compare effectiveness side-by-side
- No risk of missing critical errors

**Drawbacks**:
- Double cost (~$100-300/month for both)
- Two systems to maintain
- Potential confusion ("which tool for what?")

**When to Use Each**:
| Scenario | Use Sentry | Use Faro |
|----------|------------|----------|
| JavaScript error occurred | ✅ | ✅ |
| Investigate error details | ✅ | |
| Group similar errors | ✅ | |
| Assign error to developer | ✅ | |
| Understand user journey | | ✅ |
| Analyze performance | | ✅ |
| Track custom business events | | ✅ |
| Correlate frontend and backend | | ✅ |
| Debug slow page load | | ✅ |

**Option 2: Full Migration to Faro**

**Replace Sentry with Faro**:
- Use Faro for all observability
- Replicate critical Sentry workflows in Grafana
- Train team on Grafana

**Benefits**:
- Cost savings: $50-200/month
- Unified platform (less tool sprawl)
- Simpler mental model
- Better frontend-backend correlation

**Drawbacks**:
- Loss of Sentry's superior error grouping
- Grafana's error management is less mature
- Migration effort and risk
- Team needs to learn new tools

**Migration Checklist** (if choosing this path):
- [ ] Replicate key Sentry dashboards in Grafana
- [ ] Set up error alerting in Grafana (matching Sentry rules)
- [ ] Configure issue assignment workflow (Grafana Alerting → Jira)
- [ ] Train team on Grafana error investigation
- [ ] Document new processes (runbooks, workflows)
- [ ] Run both systems in parallel for 3 months
- [ ] Gradually shift team to use Grafana
- [ ] Cancel Sentry subscription only when team is confident

### 12.3 Gradual Migration Path (If Choosing Option 2)

**Month 1-2: Learn and Evaluate**
- Both systems running
- Team uses both
- Document pros/cons of each
- Collect feedback

**Month 3-4: Replicate Workflows**
- Create Grafana dashboards matching Sentry
- Set up alerts in Grafana
- Test error investigation workflow
- Integrate with Jira/Slack

**Month 5-6: Shift Primary Tool**
- Make Grafana primary for new errors
- Keep Sentry as fallback
- Training and documentation
- Identify gaps

**Month 7+: Decision Point**
- If Grafana fully meets needs: Deprecate Sentry
- If gaps remain: Keep both, or enhance Grafana
- Calculate actual cost savings vs lost productivity

**Risks**:
- Error grouping in Grafana is less sophisticated
  - Mitigation: Use labels and manual grouping
- Team productivity dip during transition
  - Mitigation: Thorough training and documentation
- Missing critical errors during migration
  - Mitigation: Keep both systems for overlap period

### 12.4 Recommendation

**For DSP-APP: Use complementary approach for first year**

**Rationale**:
1. Sentry is already working well - no urgent need to replace
2. Faro provides value Sentry doesn't (performance, session context, correlation)
3. Risk mitigation: Redundancy is worth the cost for critical app
4. Evaluate after 6-12 months with real data
5. Cost difference is minimal compared to developer time savings

**Re-evaluate in 12 months**:
- How often do you use each tool?
- Which provides more value?
- Have Grafana's error features improved?
- What's the actual cost vs budget?
- Team preference?

---

## Success Metrics

**Technical Metrics** (Measure after 3 months):

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Faro initialization time | <50ms | Chrome DevTools Performance |
| Bundle size increase | <5% | webpack-bundle-analyzer |
| Runtime performance overhead | <1% | Lighthouse CI |
| Collector availability | >99.9% | Grafana Cloud SLA |
| Events successfully sent | >99% | Faro dashboard |
| Zero app-blocking errors | 0 | User reports + monitoring |
| Web Vitals unchanged | LCP, INP, CLS same | CrUX report |

**Business Metrics** (Measure after 6 months):

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to debug production issues | -50% | Track time spent |
| Production errors detected proactively | >80% | Before user reports |
| Mean Time to Resolution (MTTR) | <1 hour | From alert to fix deployed |
| Support tickets related to bugs | -20% | Support system metrics |
| Team using Grafana regularly | >90% | Grafana usage analytics |
| Dashboard views per week | >50 | Grafana analytics |
| Custom events tracked | >10 types | Count distinct event names |

**ROI Metrics** (Measure after 12 months):

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Developer hours saved per month | >10 hours | Time tracking |
| Cost per month | <$200 | Grafana Cloud billing |
| User satisfaction (re: bugs) | +10% | User surveys |
| Production incidents per month | -30% | Incident tracker |

**Adoption Metrics**:

| Metric | Target | Timeline |
|--------|--------|----------|
| Dev team trained | 100% | End of Week 1 |
| Dashboards created | >5 | End of Month 1 |
| Alerts configured | >5 | End of Month 1 |
| First production error debugged with Faro | 1 | End of Month 2 |
| Product team using dashboards | >50% | End of Month 3 |

**Success Criteria for Full Rollout**:
- ✅ Zero production incidents caused by Faro
- ✅ Performance metrics within acceptable range
- ✅ Cost within budget (<$200/month)
- ✅ Team can independently use Grafana for debugging
- ✅ At least 3 bugs found and fixed using Faro insights
- ✅ Positive team feedback (survey results)

---

## Risk Mitigation

### Potential Risks and Mitigations

**1. Bundle Size Increase Impacts Performance**

**Risk**: Faro adds ~40KB gzipped, potentially slowing down page load

**Likelihood**: Medium | **Impact**: Medium

**Mitigations**:
- Lazy load Faro after app bootstrap
- Use Faro v2 (smaller bundle)
- Monitor Lighthouse scores in CI
- Set performance budget alerts
- Tree shake unused instrumentations

**Rollback Plan**: Remove Faro import if bundle grows >10%

---

**2. Runtime Performance Overhead**

**Risk**: Faro tracking slows down app, impacts user experience

**Likelihood**: Low | **Impact**: High

**Mitigations**:
- Use batching (send events in batches, not immediately)
- Sample high-frequency events
- Filter verbose console logs in production
- Profile with Chrome DevTools before rollout
- Disable in production if overhead >2%

**Rollback Plan**: Disable via feature flag immediately

---

**3. Double Instrumentation Complexity**

**Risk**: Team confused about when to use Sentry vs Faro

**Likelihood**: Medium | **Impact**: Low

**Mitigations**:
- Clear documentation: "Use X for Y"
- Training sessions with examples
- Code review guidelines
- FAQ document
- Slack channel for questions

**Rollback Plan**: N/A (documentation issue, not technical)

---

**4. Team Learning Curve**

**Risk**: Team struggles to use Grafana effectively, wasting time

**Likelihood**: Medium | **Impact**: Medium

**Mitigations**:
- Comprehensive training (3 sessions)
- Record training for future reference
- Create cheat sheets (common queries)
- Office hours for Q&A
- Start with simple dashboards, gradually add complexity

**Rollback Plan**: Continue using Sentry as primary, Faro as supplemental

---

**5. Cost Overruns**

**Risk**: Data ingestion exceeds budget, unexpected costs

**Likelihood**: Low | **Impact**: Medium

**Mitigations**:
- Start with low sampling (10%)
- Set up Grafana Cloud billing alerts
- Monitor ingestion daily first month
- Filter verbose logs
- Use free tier first, upgrade only if needed

**Rollback Plan**: Reduce sampling rate or disable non-essential events

---

**6. Privacy / GDPR Concerns**

**Risk**: Faro accidentally collects PII (personally identifiable information)

**Likelihood**: Low | **Impact**: High

**Mitigations**:
- Hash all user identifiers (UUID v5)
- Implement `beforeSend` filter to mask sensitive data
- Don't track email addresses or names
- Document what data is collected
- Legal/privacy team review before production
- Use EU region for EU users (GDPR compliance)

**Rollback Plan**: Disable Faro and delete collected data

---

**7. Collector Downtime**

**Risk**: Grafana Cloud collector is unavailable, data is lost

**Likelihood**: Low | **Impact**: Low

**Mitigations**:
- Faro SDK has built-in retry logic
- Queue events in IndexedDB when offline
- Grafana Cloud SLA is >99.9%
- Monitor collector availability
- Graceful degradation (app continues working)

**Rollback Plan**: N/A (temporary outage, no action needed)

---

**8. Conflicts with Existing Sentry**

**Risk**: Faro and Sentry interfere with each other, duplicate errors

**Likelihood**: Low | **Impact**: Low

**Mitigations**:
- Both libraries are designed to coexist
- Test in dev environment first
- Monitor for duplicate alerts
- Use different error filtering for each
- If conflicts arise, disable one temporarily

**Rollback Plan**: Disable Faro, keep Sentry

---

**9. Production Incident Caused by Faro**

**Risk**: Faro bug breaks production app

**Likelihood**: Very Low | **Impact**: Very High

**Mitigations**:
- Phased rollout (dev → stage → canary → prod)
- Feature flag for instant disable
- Wrap Faro calls in try-catch
- Monitor error rates closely during rollout
- Rollback plan ready

**Rollback Plan**:
1. Disable via feature flag (instant)
2. Redeploy without Faro (30 minutes)
3. Investigate issue in dev environment
4. Fix and re-test before re-enabling

---

**10. Team Resistance to Change**

**Risk**: Team prefers Sentry, doesn't adopt Faro

**Likelihood**: Low | **Impact**: Medium

**Mitigations**:
- Involve team early in decision
- Demonstrate clear benefits (session context, correlation)
- Don't force migration from Sentry
- Let team use both and choose naturally
- Collect feedback and iterate

**Rollback Plan**: Keep using Sentry, use Faro as optional supplemental tool

---

**Risk Register Summary**:

| Risk | Likelihood | Impact | Priority | Status |
|------|------------|--------|----------|--------|
| Bundle size increase | Medium | Medium | High | Mitigated (lazy load) |
| Performance overhead | Low | High | High | Mitigated (sampling) |
| Double instrumentation confusion | Medium | Low | Medium | Mitigated (docs) |
| Learning curve | Medium | Medium | Medium | Mitigated (training) |
| Cost overruns | Low | Medium | Medium | Mitigated (alerts) |
| Privacy concerns | Low | High | High | Mitigated (hashing) |
| Collector downtime | Low | Low | Low | Accepted |
| Conflicts with Sentry | Low | Low | Low | Mitigated (testing) |
| Production incident | Very Low | Very High | Critical | Mitigated (phased rollout) |
| Team resistance | Low | Medium | Medium | Mitigated (involvement) |

---

## Timeline Estimate

### 6-8 Week Implementation Plan

#### **Week 1: Setup and Foundation**
**Developer Hours**: 20-30

- [ ] Upgrade to Faro v2 (`package.json` changes)
- [ ] Review breaking changes and test build
- [ ] Create `FaroAnalyticsService` skeleton
- [ ] Create `faro-initializer.ts`
- [ ] Define TypeScript interfaces (`FaroConfig`)
- [ ] Update config files (all environments)
- [ ] Set up local Docker Compose environment
- [ ] Create mock collector alternative
- [ ] Test basic initialization in dev environment

**Deliverables**:
- Faro packages upgraded
- Service skeleton created
- Local dev environment working

---

#### **Week 2: Core Implementation**
**Developer Hours**: 30-40

- [ ] Implement `FaroAnalyticsService` fully
  - Setup method
  - User tracking (hash with UUID v5)
  - Custom event tracking
  - Error tracking
  - Session context
- [ ] Create APP_INITIALIZER in `app.module.ts`
- [ ] Integrate with `AuthService` for user tracking
- [ ] Modify `AppErrorHandler` to send to Faro
- [ ] Implement `beforeSend` data masking
- [ ] Write unit tests for service
- [ ] Test in local dev environment

**Deliverables**:
- Fully functional service
- Error handler integration
- Unit tests passing

---

#### **Week 3: Custom Event Tracking**
**Developer Hours**: 20-30

- [ ] Add events for resource operations (create, update, delete)
- [ ] Add events for search operations
- [ ] Add events for ontology operations
- [ ] Add events for authentication (login, logout)
- [ ] Add events for IIIF viewer interactions
- [ ] Document event naming conventions
- [ ] Test events appearing in local collector

**Deliverables**:
- 10+ custom event types tracked
- Events visible in local Grafana

---

#### **Week 4: Grafana Cloud Setup and Testing**
**Developer Hours**: 20-30

- [ ] Create Grafana Cloud account
- [ ] Create Frontend Observability apps (dev, stage, prod)
- [ ] Configure CORS allowed origins
- [ ] Update config files with collector URLs
- [ ] Deploy to dev-server
- [ ] Verify events in Grafana Cloud
- [ ] Create basic dashboards (overview, errors, performance)
- [ ] Set up initial alerts
- [ ] Write integration tests
- [ ] Performance benchmarking

**Deliverables**:
- Grafana Cloud configured
- Dev server deployment successful
- Basic dashboards created

---

#### **Week 5: Dashboard Development and Documentation**
**Developer Hours**: 20-30

- [ ] Create custom DSP dashboards:
  - Resource operations
  - Search performance
  - Ontology editor
  - IIIF viewer
  - User activity
  - Error analytics
- [ ] Import pre-built Faro dashboards
- [ ] Configure dashboard variables (environment, version)
- [ ] Write developer documentation
- [ ] Write dashboard user guide
- [ ] Create runbooks (3-4 key scenarios)
- [ ] Prepare training materials

**Deliverables**:
- 6+ custom dashboards
- Complete documentation
- Runbooks

---

#### **Week 6: Staging, Training, and QA**
**Developer Hours**: 15-25

- [ ] Deploy to ls-test-server
- [ ] Deploy to stage-server
- [ ] Conduct training sessions (3 sessions)
- [ ] Full QA testing with Faro enabled
- [ ] E2E tests with Faro
- [ ] Performance validation (no degradation)
- [ ] Security/privacy review
- [ ] Team feedback collection
- [ ] Bug fixes based on feedback

**Deliverables**:
- Stage deployment successful
- Team trained
- QA complete

---

#### **Week 7: Production Canary Rollout**
**Developer Hours**: 10-15

- [ ] Deploy to production with feature flag
- [ ] Enable for 10% of users (canary)
- [ ] Monitor closely for 48 hours
  - Error rates
  - Performance metrics
  - User complaints
  - Collector availability
- [ ] Daily team check-ins
- [ ] Collect metrics on MTTR, debug time
- [ ] Document any issues and resolutions

**Deliverables**:
- Production canary successful
- No incidents
- Metrics collected

---

#### **Week 8: Full Production Rollout and Retrospective**
**Developer Hours**: 10-15

- [ ] Gradually increase rollout (25%, 50%, 75%, 100%)
- [ ] Monitor at each stage
- [ ] Update documentation based on learnings
- [ ] Final training for support team
- [ ] Set up ongoing monitoring dashboards
- [ ] Conduct retrospective meeting
  - What went well
  - What could be improved
  - Lessons learned
- [ ] Plan next iteration (enhancements)

**Deliverables**:
- 100% production rollout
- Retrospective document
- Next iteration plan

---

### Summary Timeline

| Phase | Duration | Developer Hours | Key Milestone |
|-------|----------|-----------------|---------------|
| Setup | Week 1 | 20-30 | Local dev working |
| Core Implementation | Week 2 | 30-40 | Service complete |
| Event Tracking | Week 3 | 20-30 | Events tracked |
| Grafana Setup | Week 4 | 20-30 | Cloud configured |
| Dashboards & Docs | Week 5 | 20-30 | Docs complete |
| Staging & Training | Week 6 | 15-25 | Team trained |
| Canary Rollout | Week 7 | 10-15 | Canary successful |
| Full Rollout | Week 8 | 10-15 | Production complete |
| **Total** | **8 weeks** | **145-215 hours** | **Faro in production** |

**Total Effort**: ~4-5 weeks of full-time developer work, spread over 8 calendar weeks

---

### Critical Path

**Must be done sequentially**:
1. Week 1 (Setup) → Week 2 (Implementation) → Week 3 (Events)
2. Week 4 (Grafana Cloud) → Week 5 (Dashboards)
3. Week 6 (Staging) → Week 7 (Canary) → Week 8 (Full rollout)

**Can be done in parallel**:
- Documentation (Week 5) can start during Week 3-4
- Training materials (Week 5) can be prepared while waiting for staging deployment
- Dashboard creation (Week 5) can happen while staging deployment is being tested

---

### Buffer and Contingency

**Add 2-3 weeks buffer for**:
- Unexpected technical issues
- Team availability (holidays, other priorities)
- Feedback-driven iterations
- Additional testing if needed

**Realistic Timeline**: **10-11 weeks** for fully production-ready implementation

---

## Recommendation Priority

### Must-Have (Phase 1) - Critical for Success

**Priority 1A: Foundation** (Weeks 1-2)
1. ✅ Upgrade to Faro v2
2. ✅ Create `FaroAnalyticsService`
3. ✅ Set up local development environment (Docker or mock)
4. ✅ Integrate with existing error handler
5. ✅ Basic configuration system

**Why**: Without foundation, nothing else works. Local dev environment is essential for testing.

**Priority 1B: Basic Observability** (Weeks 3-4)
1. ✅ Custom event tracking for key features (resources, search)
2. ✅ Grafana Cloud setup (dev environment)
3. ✅ Basic dashboards (overview, errors)
4. ✅ Error alerting
5. ✅ Unit and integration tests

**Why**: Provides immediate value - can start debugging with Faro data.

---

### Should-Have (Phase 2) - High Value

**Priority 2A: Production Readiness** (Weeks 5-6)
1. ✅ Custom DSP-specific dashboards
2. ✅ Comprehensive documentation (dev + user)
3. ✅ Team training
4. ✅ Production Grafana Cloud setup
5. ✅ Security/privacy review

**Why**: Required for safe production deployment and team adoption.

**Priority 2B: Production Deployment** (Weeks 7-8)
1. ✅ Phased rollout (canary → full)
2. ✅ Performance validation
3. ✅ Cost monitoring
4. ✅ Runbooks for common scenarios

**Why**: Ensures smooth production launch with minimal risk.

---

### Nice-to-Have (Phase 3) - Future Enhancements

**Priority 3A: Advanced Features** (Post-launch, Month 2-3)
1. ⭐ Advanced correlation with DSP-API (requires backend instrumentation)
2. ⭐ Session replay for debugging
3. ⭐ More granular performance tracking
4. ⭐ User cohort analysis
5. ⭐ A/B testing with Faro data

**Why**: Provides additional insights but not critical for initial launch.

**Priority 3B: Optimization** (Post-launch, Month 3-6)
1. ⭐ Sentry migration evaluation
2. ⭐ Cost optimization (if needed)
3. ⭐ Advanced dashboard features
4. ⭐ Custom alerting rules
5. ⭐ Long-term data retention strategy

**Why**: Continuous improvement based on real usage data.

---

### Minimum Viable Product (MVP)

**If you need to ship faster (4-5 weeks)**:

**Include**:
- Faro v2 upgrade
- Basic `FaroAnalyticsService` (errors + custom events)
- Local dev environment (mock collector is faster than Docker)
- AppErrorHandler integration
- 3-5 key custom events (resource.created, search.performed)
- Grafana Cloud setup (dev + prod)
- 2-3 basic dashboards (overview, errors)
- Basic documentation
- Dev-server testing only (skip staging)

**Exclude** (add later):
- Comprehensive event tracking
- Custom DSP dashboards
- Formal training (rely on documentation)
- Canary rollout (go straight to 10% production sampling)
- Advanced features

**MVP Timeline**: 4-5 weeks (vs 8 weeks for full implementation)

---

### Recommended Approach

**For DSP-APP**: Go with the **full 8-week plan** (Phase 1 + Phase 2)

**Rationale**:
1. DSP-APP is critical infrastructure - worth investing in proper observability
2. 8 weeks is reasonable for the value gained
3. Phased rollout minimizes risk
4. Proper training ensures team adoption
5. Good documentation reduces future maintenance burden

**If timeline is tight**: Do MVP (4-5 weeks) but commit to Phase 2 enhancements within 2 months

**Phase 3**: Evaluate after 3-6 months based on:
- Team feedback
- Cost vs value
- Sentry vs Faro preference
- Backend instrumentation readiness

---

## Appendix

### A. References and Resources

**Grafana Faro Documentation**:
- Official Docs: https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/
- GitHub: https://github.com/grafana/faro-web-sdk
- Angular Tutorial: https://github.com/grafana/faro-web-sdk/blob/main/docs/sources/tutorials/use-angular.md
- Faro v2 Upgrade Guide: https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/upgrading/upgrade-v2/

**Grafana Cloud**:
- Pricing: https://grafana.com/pricing/
- Free Trial: https://grafana.com/auth/sign-up/create-user
- Frontend Observability: https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/

**Angular Resources**:
- Angular Performance: https://angular.dev/best-practices/runtime-performance
- APP_INITIALIZER: https://angular.dev/api/core/APP_INITIALIZER
- ErrorHandler: https://angular.dev/api/core/ErrorHandler

**Web Performance**:
- Web Vitals: https://web.dev/vitals/
- Lighthouse: https://developer.chrome.com/docs/lighthouse/
- Chrome User Experience Report: https://developer.chrome.com/docs/crux/

### B. Glossary

- **RUM**: Real User Monitoring - collecting performance data from actual users
- **LCP**: Largest Contentful Paint - measures loading performance
- **FID**: First Input Delay - measures interactivity (deprecated, replaced by INP)
- **INP**: Interaction to Next Paint - measures responsiveness to user interactions
- **CLS**: Cumulative Layout Shift - measures visual stability
- **TTFB**: Time to First Byte - measures server response time
- **FCP**: First Contentful Paint - measures when first content appears
- **OpenTelemetry**: Open-source observability framework for traces, metrics, logs
- **LogQL**: Query language for Grafana Loki (logs)
- **PromQL**: Query language for Prometheus (metrics)
- **TraceQL**: Query language for Grafana Tempo (traces)
- **Cardinality**: Number of unique metric series (affects cost)
- **Sampling**: Tracking only a percentage of sessions to reduce costs
- **Instrumentation**: Code that collects observability data

### C. Contact Information

**Grafana Support**:
- Community Forum: https://community.grafana.com/
- GitHub Issues: https://github.com/grafana/faro-web-sdk/issues
- Grafana Labs Support: support@grafana.com (Pro/Enterprise customers)

**Internal (DSP Team)**:
- Dev Lead: [Name]
- DevOps: [Name]
- Product Manager: [Name]
- Slack Channel: #grafana-faro

### D. Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-21 | 1.0 | Initial plan created | Assistant |

---

## Conclusion

This comprehensive plan provides a structured approach to integrating Grafana Faro into DSP-DAS. The 8-week phased rollout minimizes risk while ensuring proper testing, documentation, and team adoption.

**Key Takeaways**:
1. **Low Risk**: Phased rollout with feature flags allows instant rollback
2. **High Value**: 200-400% ROI from faster debugging and better insights
3. **Complements Sentry**: Use both tools for their respective strengths
4. **Team-Centric**: Comprehensive training and documentation ensure adoption
5. **Cost-Effective**: Estimated $0-200/month with proper sampling
6. **Production-Ready**: Thorough testing and monitoring ensure stability

**Next Steps**:
1. Review and approve this plan
2. Allocate developer time (145-215 hours over 8 weeks)
3. Set up Grafana Cloud account
4. Begin Week 1: Setup and Foundation
5. Schedule training sessions
6. Commit to full Phase 1+2 implementation

**Success**: In 8 weeks, DSP-APP will have world-class frontend observability, enabling faster debugging, better performance insights, and data-driven product decisions.

---

*Document Version: 1.0*
*Last Updated: 2025-10-21*
*Status: Draft - Awaiting Approval*
