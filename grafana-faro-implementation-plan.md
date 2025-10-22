# Grafana Faro Implementation Plan

## Overview

**Goal**: Add Grafana Faro Web SDK to DSP-APP for frontend observability and real user monitoring.

**Current State**: Faro packages (v1.19.0) already installed but not implemented. Sentry remains active for error tracking.

**Approach**: Run Faro alongside Sentry. Simple setup, no enterprise complexity.

---

## 1. Package Updates

### Upgrade to Faro v2
Latest stable version with better performance and Web Vitals v5 (INP metric).

```bash
npm install @grafana/faro-web-sdk@^2.0.0 @grafana/faro-web-tracing@^2.0.0
```

**Migration notes**: https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/upgrading/upgrade-v2/

Key changes:
- `session_id` → `session.id`
- Console config moves to global setup
- Experimental packages removed

---

## 2. Configuration

### Add Faro config to environment files

**Location**: `apps/dsp-app/src/config/config.*.json`

```json
{
  "instrumentation": {
    "environment": "prod",
    "rollbar": { ... },
    "faro": {
      "enabled": true,
      "collectorUrl": "https://faro-collector-eu-west-0.grafana.net/collect/{APP_KEY}",
      "appName": "dsp-app",
      "sessionTracking": {
        "enabled": true,
        "persistent": true,
        "samplingRate": 0.1
      },
      "console": {
        "enabled": true,
        "disabledLevels": ["log", "info", "debug"]
      }
    }
  }
}
```

**Per environment:**
- `local-dev`: `enabled: false` (or point to mock collector)
- `dev-server`: `enabled: true`, `samplingRate: 1.0`, all console levels
- `stage-server`: `enabled: true`, `samplingRate: 0.5`, warn/error only
- `production`: `enabled: true`, `samplingRate: 0.1`, error only

### TypeScript interfaces

**File**: `libs/vre/core/config/src/lib/config-types.ts`

```typescript
export interface FaroConfig {
  enabled: boolean;
  collectorUrl: string;
  appName: string;
  sessionTracking: {
    enabled: boolean;
    persistent: boolean;
    samplingRate: number;
  };
  console: {
    enabled: boolean;
    disabledLevels: ('log' | 'info' | 'warn' | 'error' | 'debug')[];
  };
}

export interface DspInstrumentationConfig {
  environment: string;
  rollbar: {...};
  faro?: FaroConfig;
}
```

### Injection token

**File**: `libs/vre/core/config/src/lib/config.tokens.ts`

```typescript
export const FaroConfigToken = new InjectionToken<FaroConfig>('FaroConfig');
```

**Provider** in `apps/dsp-app/src/app/app.module.ts`:

```typescript
{
  provide: FaroConfigToken,
  useFactory: (appConfigService: AppConfigService) =>
    appConfigService.dspInstrumentationConfig.faro,
  deps: [AppConfigService]
}
```

---

## 3. Service Implementation

### File structure

```
libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/
├── faro-analytics.service.ts
├── faro-analytics.service.spec.ts
├── faro-initializer.ts
└── index.ts
```

### Faro service

**File**: `libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/faro-analytics.service.ts`

```typescript
import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { initializeFaro, getWebInstrumentations, Faro } from '@grafana/faro-web-sdk';
import { v5 as uuidv5 } from 'uuid';
import { FaroConfigToken } from '@dasch-swiss/vre/core/config';
import { AuthService, AccessTokenService } from '@dasch-swiss/vre/core/session';

@Injectable({
  providedIn: 'root',
})
export class FaroAnalyticsService {
  private config = inject(FaroConfigToken);
  private authService = inject(AuthService);
  private accessTokenService = inject(AccessTokenService);
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
          version: '<VERSION>', // From package.json
          environment: '<ENV>', // From config
        },
        instrumentations: [
          ...getWebInstrumentations({
            captureConsole: this.config.console.enabled,
            captureConsoleDisabledLevels: this.config.console.disabledLevels,
          }),
        ],
        sessionTracking: this.config.sessionTracking,
      });

      this.setupUserTracking();
    } catch (error) {
      console.error('Faro initialization failed:', error);
    }
  }

  private setupUserTracking(): void {
    this.authService
      .isCredentialsValid$()
      .pipe(takeUntilDestroyed())
      .subscribe(isValid => {
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
    const hashedUserId = uuidv5(userIri, uuidv5.URL);
    this.faroInstance?.api.setUser({
      id: hashedUserId,
    });
  }

  private removeUser(): void {
    this.faroInstance?.api.setUser({
      id: undefined,
    });
  }

  trackEvent(name: string, attributes?: Record<string, any>): void {
    if (!this.faroInstance) return;
    this.faroInstance.api.pushEvent(name, attributes, 'custom');
  }

  trackError(error: Error, context?: Record<string, any>): void {
    if (!this.faroInstance) return;
    this.faroInstance.api.pushError(error, { context });
  }
}
```

### APP_INITIALIZER

**File**: `libs/vre/3rd-party-services/analytics/src/lib/faro-analytics/faro-initializer.ts`

```typescript
import { FaroAnalyticsService } from './faro-analytics.service';

export function faroInitializer(faroService: FaroAnalyticsService): () => void {
  return () => {
    try {
      faroService.setup();
    } catch (error) {
      console.error('Faro initialization failed:', error);
    }
  };
}
```

### Register in app module

**File**: `apps/dsp-app/src/app/app.module.ts`

```typescript
import { APP_INITIALIZER } from '@angular/core';
import { FaroAnalyticsService, faroInitializer } from '@dasch-swiss/vre/3rd-party-services/analytics';

@NgModule({
  providers: [
    // ... existing providers
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

---

## 4. Error Handler Integration

**File**: `libs/vre/core/error-handler/src/lib/app-error-handler.ts`

Add Faro tracking alongside existing Sentry tracking:

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
    // Send to Faro (NEW)
    this.sendErrorToFaro(error);

    // Existing Sentry and notification logic...
    // (no changes to existing code)
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

      // Don't send user feedback errors (not bugs)
      if (!(error instanceof UserFeedbackError)) {
        this._faroService.trackError(error, context);
      }
    } catch (faroError) {
      console.error('Failed to send error to Faro:', faroError);
    }
  }
}
```

---

## 5. Custom Event Tracking (Optional)

Add custom events throughout the app for business metrics:

```typescript
// Resource operations
this.faroService.trackEvent('resource.created', {
  resourceType: 'StillImageRepresentation',
  projectUuid: this.projectUuid,
});

// Search operations
this.faroService.trackEvent('search.performed', {
  searchType: 'fulltext',
  resultCount: results.length,
});

// Authentication
this.faroService.trackEvent('auth.login', {
  success: true,
});
```

---

## 6. Local Development Setup

### Option A: Disable locally

**File**: `apps/dsp-app/src/config/config.dev.json`

```json
{
  "instrumentation": {
    "faro": {
      "enabled": false
    }
  }
}
```

### Option B: Mock collector

**File**: `tools/faro-mock-collector.js`

```javascript
const http = require('http');

const PORT = 12345;

const server = http.createServer((req, res) => {
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
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      console.log('[Faro]', JSON.parse(body));
      res.writeHead(200);
      res.end('{"status":"ok"}');
    });
  }
});

server.listen(PORT, () => {
  console.log(`Faro mock collector: http://localhost:${PORT}`);
});
```

**Usage**:
```bash
# Terminal 1
node tools/faro-mock-collector.js

# Terminal 2
npm run start-local
```

---

## 7. Grafana Cloud Setup

### Get collector URL

1. Log into Grafana Cloud
2. Navigate to **Frontend Observability**
3. Create application: `dsp-app-production`
4. Copy collector URL
5. Configure CORS origins:
   - `https://app.dasch.swiss`
   - `https://stage.dasch.swiss`
   - `https://dev.dasch.swiss`

### Create separate apps per environment

- `dsp-app-dev` → dev-server
- `dsp-app-stage` → stage-server
- `dsp-app-production` → production

Update collector URLs in respective config files.

---

## 8. Grafana Dashboards

### Use pre-built dashboards

1. In Grafana Cloud, go to **Dashboards** → **Import**
2. Import Faro Web SDK dashboards
3. Select appropriate data sources (Loki, Tempo)

### Key panels to monitor

- **Error rate** over time
- **Web Vitals** (LCP, INP, CLS)
- **Session count** and duration
- **Page load performance**
- **Top errors** by frequency

### Custom queries

**Error rate** (LogQL):
```logql
sum(rate({app="dsp-app"} |= "error" [5m]))
```

**Search performance** (LogQL):
```logql
quantile_over_time(0.95,
  {app="dsp-app"} |= "search.performed"
  | json
  | unwrap duration [5m]
)
```

---

## 9. Testing

### Unit tests

Mock Faro SDK:

```typescript
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

Test that:
- Service doesn't initialize when `enabled: false`
- Errors are tracked with correct context
- User tracking works on login/logout
- Graceful failure if Faro init fails

### E2E tests

Disable Faro in E2E config to avoid noise:

```json
{
  "instrumentation": {
    "faro": {
      "enabled": false
    }
  }
}
```

Or intercept collector calls:

```typescript
cy.intercept('POST', '**/collect', { status: 'ok' }).as('faro');
```

---

## 10. Deployment Checklist

- [ ] Update packages to Faro v2
- [ ] Add config to all environment files
- [ ] Implement service and initializer
- [ ] Add error handler integration
- [ ] Write unit tests
- [ ] Set up Grafana Cloud apps
- [ ] Update config files with collector URLs
- [ ] Test in dev-server
- [ ] Deploy to stage
- [ ] Monitor for 24 hours
- [ ] Deploy to production
- [ ] Set up Grafana dashboards
- [ ] Configure alerts (error rate, performance)

---

## Notes

### Sampling strategy

- **Production**: 10% sessions, 100% errors
- **Stage**: 50% sessions
- **Dev**: 100% sessions

Adjust based on actual data volume and costs.

### Data to avoid

Don't track:
- User email addresses (use hashed IDs)
- JWT tokens
- Personal resource content
- Passwords/API keys

### Parallel operation with Sentry

Both systems run simultaneously:
- **Sentry**: Error tracking and issue management
- **Faro**: Performance monitoring and session context

Re-evaluate after 6-12 months to decide if both are needed.

---

## Resources

- [Faro v2 upgrade guide](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/upgrading/upgrade-v2/)
- [Faro Web SDK docs](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/instrument/browser/)
- [Grafana Cloud Frontend Observability](https://grafana.com/docs/grafana-cloud/monitor-applications/frontend-observability/)
