# DSP-APP Documentation

This is the DSP-APP documentation, based on [MkDocs](https://www.mkdocs.org) and published
under [https://docs.dasch.swiss/latest/DSP-APP/](https://docs.dasch.swiss/latest/DSP-APP/).

## Contribute

If you would like to add your own contributions to the docs, please read the following information regarding the file structure to ensure you follow the same structure.

### File structure

The documentation consists of three main topics with subordinate themes:

1. **index** contains all information about the DSP-APP
1. **user-guide** contains the DSP-APP user guide
    - Index = Introduction: All about login, registration and DSP APP information in general.
    - Project = All about project administration; part of DSP-ADMIN
    - User = All about user administration; part of DSP-ADMIN
    - System = All about system administration; part of DSP-ADMIN
    - Data = All about data management; part of VRE. In the current DSP-APP ADMIN version it's commented out
1. **contribution** contains all information for people who wants to contribute to DSP-APP
    - Index = How to contribute incl. link to the general DSP contribution guidelines (<https://docs.dasch.swiss/developers/dsp/contribution/>)
    - Release Notes = Contains the CHANGELOG file of DSP-APP

Images like screenshots and so on have to be stored in `assets/images`.

The `mkdocs.yml` file is present in the top-level directory of the repo and the source files are in the `docs/` folder.

Plugins have to be defined in `requirements.txt` and in the github actions workflow `deploy-docs` step under `EXTRA_PACKAGES`.

## Getting Started

To run the documentation locally you'll need [Python](https://www.python.org/) installed, as well as the Python package manager [pip](http://pip.readthedocs.io/en/stable/installing/). You can check if you already have these installed by running the following commands from the command line:

```shell
$ python --version
Python 3.8.2
$ pip --version
pip 20.0.2 from /usr/local/lib/python3.8/site-packages/pip (python 3.8)
```

MkDocs supports Python versions 3.5, 3.6, 3.7, 3.8, and pypy3.

### Installing dependencies

Install the required packages by running the following command:

```shell
make docs-install-requirements
```

### Running the documentation locally

MkDocs comes with a built-in dev-server that lets you preview your documentation as you work on it. Make sure you're in the same directory as the `mkdocs.yml` (repository's root folder) configuration file, and then start the server by running the following command:

```shell
$ make docs-serve
INFO    -  Building documentation...
INFO    -  Cleaning site directory
[I 160402 15:50:43 server:271] Serving on http://127.0.0.1:8000
[I 160402 15:50:43 handlers:58] Start watching changes
[I 160402 15:50:43 handlers:60] Start detecting changes
```

Open up <http://127.0.0.1:8000/> in your browser, and you'll see the documentation start page being.

In case you need to clean the project directory, run:

```shell
make docs-clean
```

To get some help about the `make` commands, run:

```shell
make help
```

### Building the documentation

To build the documentation, run:

```shell
make docs-build
```

### Deploying github page

On each release of DSP-APP, a github action script will build and deploy the documentation on [dasch-swiss.github.io/dsp-app](https://dasch-swiss.github.io/dsp-app). Behind the scenes, MkDocs builds the documentation and uses the [mkdocs-deploy-gh-pages](https://github.com/marketplace/actions/deploy-mkdocs) actions script to deploy them to the gh-pages. That's it!
