import { z } from 'zod';
/**
 * If enabled, then the following values are required:
 * - accessToken
 */
export const Rollbar = z.discriminatedUnion('enabled', [
  z.object({
    enabled: z.literal(true),
    accessToken: z.string().nonempty(),
  }),
  z.object({ enabled: z.literal(false), accessToken: z.string().optional() }),
]);
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Rollbar = z.infer<typeof Rollbar>;

export const Faro = z.object({
  enabled: z.boolean(),
  collectorUrl: z.string(),
  appName: z.string(),
  sessionTracking: z.object({
    enabled: z.boolean(),
    persistent: z.boolean(),
    samplingRate: z.number().min(0).max(1),
  }),
  console: z.object({
    enabled: z.boolean(),
    disabledLevels: z.array(z.enum(['log', 'info', 'warn', 'error', 'debug'])),
  }),
  otlp: z
    .object({
      logsUrl: z.string(),
      tracesUrl: z.string(),
    })
    .optional(),
});
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type Faro = z.infer<typeof Faro>;

export const Instrumentation = z.object({
  environment: z.string(),
  rollbar: Rollbar,
  faro: Faro,
});

export type InstrumentationType = z.infer<typeof Instrumentation>;

export const FeatureFlags = z.object({
  allowEraseProjects: z.boolean(),
});

export type FeatureFlagsType = z.infer<typeof FeatureFlags>;

/**
 * Our codebase requires number | null. The config will contain either a number
 * or an empty string. We need to transform the empty string case into a null.
 */
export const ApiPort = z
  .number()
  .or(z.string().max(0))
  .transform(val => {
    if (typeof val === 'number') {
      return val;
    } else {
      return null;
    }
  });

/**
 * Our codebase requires number | null. The config will contain either a number
 * or an empty string. We need to transform the empty string case into a null.
 */
export const IiifPort = z
  .number()
  .or(z.string().max(0))
  .transform(val => {
    if (typeof val === 'number') {
      return val;
    } else {
      return null;
    }
  });

/**
 * Definition of the AppConfig schema for validation of config.json.
 */
export const AppConfig = z.object({
  dspRelease: z.string(),
  apiProtocol: z.enum(['http', 'https']),
  apiHost: z.string().nonempty("required 'apiHost' value missing in config"),
  apiPort: ApiPort,
  apiPath: z.string(),
  iiifProtocol: z.enum(['http', 'https']),
  iiifHost: z.string().nonempty("required 'iiifHost' value missing in config"),
  iiifPort: IiifPort,
  iiifPath: z.string(),
  ingestUrl: z.string(),
  geonameToken: z.string().nonempty("required 'geonameToken' value missing in config"),
  jsonWebToken: z.string(),
  iriBase: z.literal('http://rdfh.ch'),
  logErrors: z.boolean(),
  instrumentation: Instrumentation,
  featureFlags: FeatureFlags,
});

/**
 * Definition of the AppConfig type, which can be inferred from the schema.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AppConfig = z.infer<typeof AppConfig>;
