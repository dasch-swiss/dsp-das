import * as Rollbar from 'rollbar';

import {
    Injectable,
    Inject,
    InjectionToken,
    ErrorHandler
} from '@angular/core';

import { DspInstrumentationConfig } from './main/declarations/dsp-instrumentation-config';
import { DspInstrumentationToken } from './main/declarations/dsp-api-tokens';
import { AppInitService } from './app-init.service';

export const RollbarService = new InjectionToken<Rollbar>('rollbar');

const rollbarConfig: Rollbar.Configuration = {
    accessToken: 'POST_CLIENT_ITEM_TOKEN',
    enabled: false,
    captureUncaught: true,
    captureUnhandledRejections: true,
    nodeSourceMaps: false,
    inspectAnonymousErrors: true,
    ignoreDuplicateErrors: true,
    wrapGlobalEventHandlers: false,
    scrubRequestBody: true,
    exitOnUncaughtException: false,
    stackTraceLimit: 20
};

@Injectable()
export class RollbarErrorHandler implements ErrorHandler {
    constructor(
        @Inject(RollbarService) private _rollbar: Rollbar,
        @Inject(DspInstrumentationToken) private _instrConfig: DspInstrumentationConfig
    ) {
        console.log(this._instrConfig);
        console.log(this._rollbar);
    }

    handleError(err: any): void {
        this._rollbar.error(err.originalError || err);
    }
}

export function rollbarFactory() {
    return (initService: AppInitService): Rollbar => new Rollbar(
        {
            accessToken: initService.dspInstrumentationConfig.rollbar.accessToken,
            enabled: initService.dspInstrumentationConfig.rollbar.enabled,
            captureUncaught: true,
            captureUnhandledRejections: true,
            nodeSourceMaps: false,
            inspectAnonymousErrors: true,
            ignoreDuplicateErrors: true,
            wrapGlobalEventHandlers: false,
            scrubRequestBody: true,
            exitOnUncaughtException: false,
            stackTraceLimit: 20
        }
    );
}
