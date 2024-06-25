# DSP-DAS Performance Testing

This repository contains performance tests for the DSP-DAS project.
To run the tests, you need to install [k6](https://k6.io/).

Use brew to install it:

```sh
brew install k6
```

The test are based on the [k6 browser module](https://k6.io/docs/using-k6-browser/overview/) which brings browser automation and end-to-end web testing to k6 while supporting [core k6 features](https://k6.io/docs/using-k6/http-requests/).

## Running the tests

You can run the tests using the following command:

```sh
k6 run script.js
```

### Using `just`

We provide a `justfile` to make it easier to run the tests.

You can run the tests _locally_ using the following command:

```sh
just run
```

You can run the tests _in the [k6 cloud](https://k6.io/docs/cloud/)_ using the following command:

```sh
just run-cloud
```

For running in the cloud you [need to login](https://k6.io/docs/cloud/creating-and-running-a-test/cloud-tests-from-the-cli/#run-test-on-the-cli).

## Documentation

- [k6: Official Tutorial](https://k6.io/docs/examples/tutorials/get-started-with-k6/)
- [GitHub: k6-learn](https://github.com/grafana/k6-learn/blob/main/Modules/II-k6-Foundations/01-Getting-started-with-k6-OSS.md)
- [k6: More resources](https://k6.io/docs/get-started/resources/)
