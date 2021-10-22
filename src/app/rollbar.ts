import * as Rollbar from 'rollbar';

import {
    Injectable,
    Inject,
    InjectionToken,
    ErrorHandler
} from '@angular/core';

import { DspInstrumentationToken } from './main/declarations/dsp-api-tokens';
import { DspInstrumentationConfig } from './main/declarations/dsp-instrumentation-config';

const rollbarConfig = {
    accessToken: '86fd4ff29d3148999d80bdd724ce7704',
    captureUncaught: true,
    captureUnhandledRejections: true,
};

export const RollbarService = new InjectionToken<Rollbar>('rollbar');

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
    constructor(
        @Inject(DspInstrumentationToken) private _dspInstrumentationConfig: DspInstrumentationConfig,
        @Inject(RollbarService) private rollbar: Rollbar
    ) { }

    handleError(err: any): void {
        this.rollbar.error(err.originalError || err);
    }
}

export function rollbarFactory() {
    return new Rollbar(rollbarConfig);
}
