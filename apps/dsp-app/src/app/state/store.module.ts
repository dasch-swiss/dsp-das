import { NgModule } from '@angular/core';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule, RouterStateSerializer } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';
import { STATE_MODULES } from './index';
import { CustomRouterStateSerializer } from './router/router-state.serializer';
import { DEVTOOLS_REDUX_CONFIG, LOGGER_CONFIG, OPTIONS_CONFIG } from './store.config';

@NgModule({
    exports: [NgxsModule],
    imports: [
        NgxsModule.forRoot(STATE_MODULES, OPTIONS_CONFIG),
        NgxsReduxDevtoolsPluginModule.forRoot(DEVTOOLS_REDUX_CONFIG),
        NgxsLoggerPluginModule.forRoot(LOGGER_CONFIG),
        NgxsRouterPluginModule.forRoot(),
    ],
    providers: [{ provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }],
})
export class NgxsStoreModule {}
