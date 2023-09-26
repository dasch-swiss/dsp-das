export class RouteConstants {
    static readonly home = '';
    static readonly login = 'login';
    static readonly logout = 'logout';
    static readonly userAccount = 'account';
    static readonly systemAdmin = 'system';

    static readonly projects = 'projects';
    static readonly project = 'project';
    static readonly createNew = 'create-new';

    static readonly settings = 'settings';
    static readonly collaboration = 'collaboration';

    static readonly refresh = 'refresh';

    static readonly noNetworkError = 'no-network';
    static readonly notFound = '404';
    static readonly notFoundWildcard = '**';

    static readonly homeRelative = `/${RouteConstants.home}`;
    static readonly userAccountRelative = `/${RouteConstants.userAccount}`;
    static readonly systemAdminRelative = `/${RouteConstants.systemAdmin}`;

    static readonly projectsRelative = `/${RouteConstants.projects}`;
    static readonly projectRelative = `/${RouteConstants.project}`;
    static readonly newProjectRelative = `/${RouteConstants.project}/${RouteConstants.createNew}`;

    static readonly notFoundWildcardRelative = `/${RouteConstants.notFound}`;
}

export enum Auth {
    AccessToken = 'ACCESS_TOKEN',
    Refresh_token = 'REFRESH_TOKEN',
    Bearer = 'Bearer',
}