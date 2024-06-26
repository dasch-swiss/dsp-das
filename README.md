# DaSCH Applications and Libraries Monorepo

[![Github](https://img.shields.io/github/v/tag/dasch-swiss/dsp-app?include_prereleases&label=Github%20tag)](https://github.com/dasch-swiss/dsp-das)
[![Docker](https://img.shields.io/docker/v/daschswiss/dsp-app?label=Docker%20image)](https://hub.docker.com/r/daschswiss/dsp-app)
[![CI](https://github.com/dasch-swiss/dsp-das/workflows/CI/badge.svg)](https://github.com/dasch-swiss/dsp-das/actions?query=workflow%3ACI)

This monorepo host different applications and libraries of the DaSCH Service Platform.

# Install libraries

Add

```
//npm.pkg.github.com/:_authToken=YOUR_NPM_TOKEN
@dasch-swiss/dsp-js:registry=https://npm.pkg.github.com/dasch-swiss
@dasch-swiss/jdnconvertiblecalendar:registry=https://registry.npmjs.org/
```

and run ```npm install```.

## @dasch-swiss librairies

Please go to the following readme:

- [@dasch-swiss/jdnconvertiblecalendar](https://github.com/dasch-swiss/dsp-das/blob/main/libs/jdnconvertiblecalendar/README.md)
- [@dasch-swiss/jdnconvertiblecalendardateadapter](https://github.com/dasch-swiss/dsp-das/blob/main/libs/jdnconvertiblecalendardateadapter/README.md)

## DSP-APP &mdash; Generic user interface of DaSCH Service Platform

This app is a simple user interface for the research data repository of the
Swiss National Data and Service Center for the Humanities (DaSCH), which uses
the DSP-API server application in the backend. It's a system for annotation and
linkage of resources in arts and humanities.

DSP-APP implements [DSP-JS-LIB](https://www.npmjs.com/package/@dasch-swiss/dsp-js-lib)
to connect with [DSP-API](https://docs.dasch.swiss/latest/DSP-API/03-endpoints/api-v2/introduction/).
DSP (DaSCH Service Platform) is a software framework for storing, sharing, and
working with primary resources and data in the humanities.

DSP-APP is [free software](http://www.gnu.org/philosophy/free-sw.en.html), released
under [GNU Affero General Public](http://www.gnu.org/licenses/agpl-3.0.en.html) license.

## User Quickstart

To try out DSP-APP you first need to start the backend [DSP-API](https://github.com/dasch-swiss/dsp-api):

```shell
# go the dsp-api repository in a terminal and start the api
$ make init-db-test
$ make stack-without-app

# come back to this repository and start the app
$ npx nx run dsp-app:serve
```

## Developer Quickstart

The monorepo is implemented using [NX](https://nx.dev).

The most common commands are defined in `package.json`.

> **_NOTE:_** You can install `nx` globally with `npm install -g nx`. If not, then all `nx` commands below need to be prefixed with `npx`.

| nx                                                   | npm                       |
| ---------------------------------------------------- | ------------------------- |
| `nx run dsp-app:test`                                | `npm run test-local`      |
| `nx run dsp-app:test:ci`                             | `npm run test-ci`         |
| `nx run-many --all --target=test --configuration=ci` | `npm run test-ci-all`     |
| `nx run dsp-app:serve`                               | `npm run start-local`     |
| `nx run dsp-app:serve:test-server`                   | `npm run start-test`      |
| `nx run dsp-app:serve:dev-server`                    | `npm run start-dev`       |
| `nx run dsp-app:serve:ls-test-server`                | `npm run start-ls-test`   |
| `nx run dsp-app:serve:stage-server`                  | `npm run start-stage`     |
| `nx run dsp-app:serve:0845-test-server`              | `npm run start-0845-test` |
| `nx run dsp-app:lint`                                | `npm run lint-ci`         |
| `nx run dsp-app:lint --fix`                          | `npm run lint-local`      |
| `nx run dsp-app-e2e:e2e:development`                 | `npm run e2e-ci-dev`      |
| `nx run dsp-app-e2e:e2e:production`                  | `npm run e2e-ci`          |
| `nx run dsp-app:build`                               | `build`                   |
| `nx run dsp-app:build:production`                    | `build-prod`              |

| npx                                       | npm                 |
| ----------------------------------------- | ------------------- |
| `cd apps/dsp-app-e2e && npx cypress open` | `npm run e2e-local` |

### IDE plugins

- https://plugins.jetbrains.com/plugin/15101-nx-console-idea
- https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console

### E2E Tests

- There are three spm scripts to run the E2E tests.
- `npm run e2e-ci-dev` will run the E2E tests in the console in a development environment.
- `npm run e2e-ci` will run the E2E tests in the console in a production environment. This is the command that is run on GitHub CI.
- `npm run e2e-local` will open the Cypress UI which will enable you to easy run individual tests and see every step as it runs.

## Further Documentation

### User guide

➡ [for latest released version](https://docs.dasch.swiss/latest/DSP-APP/user-guide/)

### Developer docs

➡ [for developers](https://docs.dasch.swiss/latest/DSP-APP/contribution)

## Contribution

If you would like to contribute to the development of the DSP-APP alongside us,
please consult the [general DSP contribution guidelines](https://docs.dasch.swiss/latest/developers/contribution/).

### Documentation / User guidelines

We built the user guidelines and developer documentation with [MkDocs](https://www.mkdocs.org/).
Get more information in the appropriate [README](https://github.com/dasch-swiss/dsp-app/blob/main/docs/contribution/docs-documentation.md).
