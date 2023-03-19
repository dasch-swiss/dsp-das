# DSP-APPS Monorepo

[![Github](https://img.shields.io/github/v/tag/dasch-swiss/dsp-app?include_prereleases&label=Github%20tag)](https://github.com/dasch-swiss/dsp-app)
[![Docker](https://img.shields.io/docker/v/daschswiss/dsp-app?label=Docker%20image)](https://hub.docker.com/r/daschswiss/dsp-app)
[![CI](https://github.com/dasch-swiss/dsp-app/workflows/CI/badge.svg)](https://github.com/dasch-swiss/dsp-app/actions?query=workflow%3ACI)

This monorepo host different applications and libraries of the DaSCH Service Platform.

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

## Developer Monorepo Quickstart

The monorepo is implemented using [NX](https://nx.dev).

The following table shows the basic commands and the coresponding previous command:

| nx            | npm                                 | ng                                                                                                           |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npx nx test` | `npm run test-local`                | `ng test`                                                                                                    |
|               | `npm run test-ci`                   |                                                                                                              |
|               | `npm run start-with-test-server`    | `ng serve --configuration test-server`                                                                       |
|               | `npm run start-with-ls-test-server` | `ng serve --configuration ls-test-server`                                                                    |
|               | `npm run start-with-staging-server` | `ng serve --configuration staging-server`                                                                    |
|               | `lint-ci`                           | `eslint --color -c .eslintrc.js --ext .ts ./src/app`                                                         |
|               | `lint-local`                        | `eslint --color --fix -c .eslintrc.js --ext .ts ./src/app`                                                   |
|               | `e2e`                               | `ng e2e`                                                                                                     |
|               | `e2e-ci`                            | `ng e2e --configuration production --protractor-config=./e2e/protractor-ci.conf.js --webdriver-update=false` |
|               | `build-prod`                        | `ng build --configuration=production`                                                                        |
|               | `test-ci`                           | `ng test --watch=false --browsers=ChromeHeadless`                                                            |
|               | `test-local`                        | `ng test`                                                                                                    |

> **_NOTE:_** You can install `nx` globally with `npm install -g nx`. In that case prefixing the commands with `npx` is not necessary.

## Further Documentation

### User guide

➡ [for latest released version](https://docs.dasch.swiss/latest/DSP-APP/user-guide/)

### Developer docs

➡ [for developers](https://docs.dasch.swiss/latest/DSP-APP/contribution)

## Contribution

If you would like to contribute to the development of the DSP-APP alongside us,
please consult the [general DSP contribution guidelines](https://docs.dasch.swiss/latest/developers/dsp/contribution/).

### Documentation / User guidelines

We built the user guidelines and developer documentation with [MkDocs](https://www.mkdocs.org/).
Get more information in the appropriate [README](https://github.com/dasch-swiss/dsp-app/blob/main/docs/README.md).
