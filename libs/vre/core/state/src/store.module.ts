import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppConfigService } from '@dasch-swiss/vre/core/config';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule, Store } from '@ngxs/store';
import { DEVTOOLS_REDUX_CONFIG, LOGGER_CONFIG, OPTIONS_CONFIG } from './store.config';
import { ConfigState, ListsState, SetConfigAction, UserState } from './index';

export function initializeConfigState(configService: AppConfigService, store: Store) {
  return () => store.dispatch(new SetConfigAction(configService));
}

const STATE_MODULES = [UserState, ListsState, ConfigState];

@NgModule({
  exports: [NgxsModule],
  imports: [
    NgxsModule.forRoot(STATE_MODULES, OPTIONS_CONFIG),
    NgxsReduxDevtoolsPluginModule.forRoot(DEVTOOLS_REDUX_CONFIG),
    NgxsLoggerPluginModule.forRoot(LOGGER_CONFIG),
    NgxsRouterPluginModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeConfigState,
      deps: [AppConfigService, Store],
      multi: true,
    },
  ],
})
export class NgxsStoreModule {}
