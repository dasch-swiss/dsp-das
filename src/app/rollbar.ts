import * as Rollbar from 'rollbar';

import {
    Injectable,
    Inject,
    InjectionToken,
    ErrorHandler
} from '@angular/core';

import { DspInstrumentationConfig } from './main/declarations/dsp-instrumentation-config';
import { DspInstrumentationToken } from './main/declarations/dsp-api-tokens';
import { appInitFactory, AppInitService } from './app-init.service';

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

    public rollbar: Rollbar;
    constructor(
        private _appInitService: AppInitService
    ) {
        appInitFactory;
        console.log(this._appInitService.dspInstrumentationConfig);
        this.rollbar = new Rollbar(
            {
                accessToken: _appInitService.dspInstrumentationConfig.rollbar.accessToken,
                enabled: _appInitService.dspInstrumentationConfig.rollbar.enabled,
                captureUncaught: true,
                captureUnhandledRejections: true,
                nodeSourceMaps: false,
                inspectAnonymousErrors: true,
                ignoreDuplicateErrors: true,
                wrapGlobalEventHandlers: false,
                scrubRequestBody: true,
                exitOnUncaughtException: false,
                stackTraceLimit: 20
            });

        console.log(this.rollbar);
    }

    handleError(err: any): void {
        this.rollbar.error(err.originalError || err);
    }
}

export function rollbarFactory() {
    return (appInitService: AppInitService): Rollbar => new Rollbar(
        {
            accessToken: appInitService.dspInstrumentationConfig.rollbar.accessToken,
            enabled: appInitService.dspInstrumentationConfig.rollbar.enabled,
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
