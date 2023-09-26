import { CurrentPageState } from "./lib/current-page/current-page.state";
import { ProjectsState } from "./lib/projects/projects.state";
import { UserState } from "./lib/user/user.state";
import { NgxsStoreModule } from "./store.module";

export * from './lib/user/user.selectors';
export * from './lib/projects/projects.selectors';
export * from './lib/current-page/current-page.selectors';

export * from './lib/user/user.actions';
export * from './lib/projects/projects.actions';

export * from './lib/user/user.state-model';
export * from './lib/projects/projects.state-model';

export * from './lib/user/user.state';
export * from './lib/projects/projects.state';

export const STATE_MODULES = [
    UserState,
    ProjectsState,
    CurrentPageState
];
