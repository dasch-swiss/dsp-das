import { InjectionToken } from '@angular/core';
import { KnoraApiConfig, KnoraApiConnection } from '@dasch-swiss/dsp-js';
import { DspInstrumentationConfig } from './dsp-instrumentation-config';

// config for dsp-js-lib (@dasch-swiss/dsp-js) config object
export const DspApiConfigToken = new InjectionToken<KnoraApiConfig>('DSP api configuration');

// connection config for dsp-js-lib (@dasch-swiss/dsp-js) connection
export const DspApiConnectionToken = new InjectionToken<KnoraApiConnection>('DSP api connection instance');

// config for datadog
export const DspInstrumentationToken = new InjectionToken<DspInstrumentationConfig>('DSP instrumentation configuration');
