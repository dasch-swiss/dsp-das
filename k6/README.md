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
k6 run tests/<test_script.js>
```

### Tests Which Require Authentication

Tests that require authentication need to be run with the correct environment variables set.

For example locally you can store the credentials in a `.env` file:

```sh
export DSP_APP_USERNAME='admin'
export DSP_APP_PASSWORD='password'
```

Before running the tests you can source the file:

```sh
source .env
```

Then you can run the test as described above.

### Using `just`

We provide a `justfile` to make it easier to run the tests.
If you don't have [`just`](https://just.systems/man/en/) installed, you can install it using brew:

```sh
brew install just
```

Listing all the available tests:

```sh
just list
```

You can run the tests _locally_ using the following command:

```sh
just run <test_name>
```

### Flexible Environment Testing

Run tests against any environment using the `env` parameter:

```sh
# Run against specific environments
just run <test_name> dev      # DEV environment (default)
just run <test_name> dev02    # DEV-02 environment  
just run <test_name> stage    # STAGE environment
just run <test_name> prod     # PRODUCTION environment

# Use custom URLs
just run <test_name> "https://my-custom-url.com"

# List available environments
just environments
```

### Environment Comparison

Compare performance between any two environments:

```sh
# Flexible comparison (default: stage vs dev02)
just compare <test_name>                    # STAGE vs DEV-02
just compare <test_name> dev stage          # DEV vs STAGE
just compare <test_name> prod dev02         # PROD vs DEV-02

# Convenience aliases
just compare-stage-dev02 <test_name>        # Quick STAGE vs DEV-02
just compare-dev-stage <test_name>          # Quick DEV vs STAGE
```

Environment URLs are defined in the `justfile` and fallback to constants in `options/constants.js`.

You can run the tests _in the [k6 cloud](https://k6.io/docs/cloud/)_ using the following command:

```sh
just run-cloud <test_name>
```

For running in the cloud you [need to login](https://k6.io/docs/cloud/creating-and-running-a-test/cloud-tests-from-the-cli/#run-test-on-the-cli).

## Developing the tests locally without k6 cloud

This setup contains a `docker-compose.yml` file that allows you to run the tests locally without having to install Grafana. You can run the tests and export its metrics to the local Grafana instance.

All tests are found in the `./tests` folder.
The folder `./options` contains common [options](https://k6.io/docs/using-k6/k6-options/) for running the test, e.g. number of VU, certain [scenarios](https://k6.io/docs/using-k6/scenarios/) and such.
The folder `./pages` contains [page objects](https://martinfowler.com/bliki/PageObject.html) modelling reusable pages for use in the tests.

### Setting up the environment

Start Grafana with InfluxDB instances:

```sh
just grafana-up
```

#### Create a Dashboard for Browser Tests

This will open up the create dashboard page in the browser and copy the `grafana_dashboard.json` to your clipboard. On this page you have to "import a dashboard" and paste the json and save.

Stopping the Grafana stack is done with:

```sh
just grafana-down
```

[IMPORTANT] The Grafana setup is not persistent. If you stop the containers, the data will be lost and you will have to recreate the dashboard with the steps above.

#### Create a Dashboard for HTTP Tests

Grafana provides some [preconfigured dashboards](https://grafana.com/grafana/dashboards/?search=k6), unfortunately they do not provide one for the browser metrics.
If you are using `k6`'s `http` for testing API you might want to import the [nr `2587` "k6 Load Testing Results"](https://grafana.com/grafana/dashboards/2587-k6-load-testing-results/) dashboard.

### Visualizing the test results in Grafana

When running the tests you have to instruct k6 to export the metrics to the Grafana instance. You can do this by setting the `K6_OUT` environment variable to the url of the InfluxDB instance.

We have a `just` command that sets this variable for you:

```sh
just run-grafana <test_name>
```

## Store Refactor Regression Tests

The store refactor regression tests measure the performance impact of replacing stores with BehaviorSubject services. These tests are specifically designed to validate that the refactoring maintains or improves performance while avoiding common pitfalls.

### 🎯 Test Types

#### 1. Quick Regression Test (`regression-quick`)
**Purpose:** Fast regression check (2-3 minutes)  
**Best for:** CI/CD pipelines, quick validation

```bash
just regression-quick
```

**What it tests:**
- Bootstrap performance (app startup time)
- Basic memory patterns 
- UI interaction responsiveness

**Thresholds:**
- Bootstrap: < 5s
- Memory growth: < 5MB
- State updates: < 1s

#### 2. Comprehensive Regression Test (`regression-full`)
**Purpose:** Deep performance analysis (5-10 minutes)  
**Best for:** Thorough pre-deployment validation

```bash
just regression-full
```

**What it tests:**
- Memory leak detection over navigation cycles
- State update latency across multiple interaction types
- Component rendering performance
- Subscription management efficiency
- App bootstrap performance

**Thresholds:**
- Memory growth: < 10MB
- State updates: < 500ms
- Component renders: < 200ms
- Subscription efficiency: > 80%

#### 3. Micro-benchmark Test (`regression-micro`)
**Purpose:** Detailed performance profiling (2-3 minutes)  
**Best for:** Understanding specific performance characteristics

```bash
just regression-micro
```

**What it tests:**
- Individual interaction latencies
- Memory efficiency per operation
- Subscription overhead
- State consistency

**Thresholds:**
- Interaction latency: p(95) < 300ms
- Memory per operation: < 1MB
- Subscription overhead: < 50ms
- No consistency issues

#### 4. Statistical Regression Test (`regression-statistical`) 
**Purpose:** Statistical validation with multiple iterations (8-12 minutes)  
**Best for:** Performance analysis and baseline establishment

```bash
just regression-statistical
```

**What it tests:**
- Multiple bootstrap measurements with variance analysis
- Statistical consistency of memory patterns over cycles
- State update latency with coefficient of variation
- Warmup phase to reduce measurement noise

**Key Features:**
- **Warmup Phase**: Reduces browser initialization variance
- **Multiple Iterations**: 3+ measurements for statistical significance
- **Variance Analysis**: Coefficient of variation to ensure reliable data
- **Statistical Thresholds**: p(95) and average metrics for comprehensive validation

**Thresholds:**
- Statistical reliability: > 80% of iterations reliable
- Bootstrap variance: Coefficient of variation < 20%
- Memory consistency: Max growth < 2x average
- State update consistency: Coefficient of variation < 30%

### 📊 Test Comparison Summary

| Test | Duration | Purpose | Best For | Key Focus |
|------|----------|---------|----------|-----------|
| **regression-quick** | 2-4 min | Fast validation | CI/CD pipelines | Bootstrap, basic memory, interactions |
| **regression-full** | 5-10 min | Deep analysis | Pre-deployment | Memory leaks, rendering, subscriptions |
| **regression-micro** | 30s | Micro-benchmarks | Performance debugging | Individual interactions, consistency |
| **regression-statistical** | 8-12 min | Statistical validation | Performance analysis | Multiple iterations, variance analysis |

#### 🚀 **New Optimizations & Features**

**Environment-Aware Testing:**
- Automatic environment detection from URL
- Different performance thresholds per environment (dev/stage/prod)
- Environment-specific selector strategies and timeouts

**Enhanced Error Handling:**
- Detailed error messages with stack traces
- Graceful fallback when elements aren't found
- Better diagnostic logging for troubleshooting

**Robust Element Selection:**
- Multiple selector strategies per interaction type
- Visibility and enabled state validation
- Environment-specific UI element targeting

**Statistical Validation:**
- Warmup phase to reduce measurement variance
- Multiple iterations for statistical significance
- Coefficient of variation analysis for reliability

#### Development Workflow Strategy
1. **`regression-quick`** - Run frequently during development for fast feedback with environment-aware thresholds
2. **`regression-micro`** - Use when optimizing specific interactions or debugging performance issues  
3. **`regression-statistical`** - Use for detailed performance analysis with statistical confidence
4. **`regression-full`** - Run before merging/deploying for comprehensive validation

#### CI/CD Pipeline Strategy
- **Quick automated checks**: `regression-quick` with realistic environment-specific thresholds
- **Release validation**: `regression-full` for thorough pre-deployment testing
- **Performance profiling**: `regression-micro` when issues are detected
- **Statistical analysis**: `regression-statistical` for baseline establishment and variance analysis

The tests now provide intelligent, environment-aware performance validation with realistic expectations and detailed diagnostics.

### 🔬 Environment Comparison

#### Compare Store vs BehaviorSubject
```bash
just regression-compare
```

This runs the quick regression test on both:
- **STAGE**: Current store implementation
- **DEV-02**: Your BehaviorSubject refactor

### 🎯 Environment-Specific Configuration

The regression tests now automatically detect your environment and apply appropriate thresholds:

#### Environment Detection & Thresholds

| Environment | Bootstrap | Memory Growth | State Updates | Success Rate |
|-------------|-----------|---------------|---------------|--------------|
| **DEV** | < 20s | < 60MB | < 800ms | > 50% |
| **STAGE** | < 15s | < 50MB | < 600ms | > 60% |
| **PROD** | < 12s | < 40MB | < 500ms | > 70% |

#### Environment-Specific Features

**Automatic Detection:**
```bash
# Automatically detects environment from URL
just regression-quick dev02    # Uses DEV thresholds
just regression-quick stage    # Uses STAGE thresholds
just regression-quick prod     # Uses PROD thresholds
```

**Performance Expectations:**
- **DEV**: More lenient thresholds for development builds with debug features
- **STAGE**: Production-like performance with some monitoring overhead
- **PROD**: Strictest thresholds expecting optimal performance

**Selector Strategies:**
- Different UI element selectors per environment
- Fallback strategies for various Angular Material versions
- Environment-specific timeout configurations

### 📊 Understanding Results

#### ✅ Good Results
```
✓ bootstrap_under_3s........: 100.00% ✓ 1
✓ memory_growth_under_5mb...: 100.00% ✓ 1  
✓ interactions_under_500ms..: 100.00% ✓ 3
```

#### ⚠️ Warning Signs
```
✗ memory_growth_under_5mb...: 0.00% ✗ 0 / ✓ 1
  Memory growth: 8MB (Warning: potential memory leak)
```

#### ❌ Regression Detected
```
✗ bootstrap_under_3s........: 0.00% ✗ 0 / ✓ 1
  Bootstrap time: 6500ms (Regression: 3.5s slower)
```

### 🎯 Key Metrics to Watch

#### Performance Improvements (Expected with BehaviorSubjects)
- **Faster state updates**: Direct observable subscriptions
- **Better memory management**: Automatic cleanup
- **Lower subscription overhead**: More efficient observable patterns

#### Potential Regressions (Watch for)
- **Slower bootstrap**: Larger bundle size
- **Memory leaks**: Improper subscription cleanup
- **Inconsistent state**: Race conditions in async operations

### 🚀 Usage Workflow

#### Pre-Deployment Validation
1. **Run baseline on STAGE**: `just run stage store-refactor-regression-quick`
2. **Run test on DEV-02**: `just run dev02 store-refactor-regression-quick`
3. **Compare results** and look for regressions
4. **If regressions found**: Run full tests for detailed analysis

#### CI/CD Integration
Add to your pipeline:
```bash
# Quick regression check
just regression-quick

# Fail build if thresholds not met
if [ $? -ne 0 ]; then
  echo "❌ Store refactor regression detected"
  exit 1
fi
```

#### Local Development
```bash
# Quick check during development
just regression-quick

# Detailed analysis when optimizing
just regression-full

# Micro-optimizations
just regression-micro
```

### 🔧 Customizing Tests

#### Adjust Thresholds
Edit the `thresholds` object in test files:

```javascript
// More strict thresholds
thresholds: {
  'state_update_latency': ['avg<200'], // Stricter: 200ms vs 500ms
  'memory_growth': ['value<2097152'], // Stricter: 2MB vs 5MB
}
```

#### Add Custom Metrics
```javascript
// In your test file
import { Trend } from 'k6/metrics';
const customMetric = new Trend('my_custom_metric');

// Later in test
customMetric.add(measurementValue);
```

#### Focus on Specific Features
Modify the test scenarios to focus on your specific refactored components:

```javascript
// Test specific routes that use your refactored stores
await page.goto('/your-refactored-feature');
await testYourSpecificFeature(page);
```

### 📈 Performance Targets

#### Store Refactor Goals (Environment-Adjusted)
| Goal | DEV | STAGE | PROD |
|------|-----|--------|------|
| **Bootstrap** | < 20s | < 15s | < 12s |
| **Memory Growth** | < 60MB | < 50MB | < 40MB |
| **State Updates** | < 800ms | < 600ms | < 500ms |
| **Success Rate** | > 50% | > 60% | > 70% |

#### Red Flags (Universal)
- Bootstrap time > 25s (any environment)
- Memory growth > 80MB (memory leak concern)  
- State updates > 1.5s (performance regression)
- Statistical reliability < 30% (unreliable measurements)

### 🐛 Enhanced Troubleshooting

#### Test Failures with New Diagnostics
1. **Element Selection Issues**:
   ```bash
   # Look for detailed selector logs:
   ❌ No interactive navigation elements found
   ⚠️ Selector "nav a[href]:visible" failed: undefined
   ```
   - **Solution**: Update selectors in `utils/environment-config.js`
   - **Alternative**: Use `regression-statistical` for more robust element detection

2. **Environment Threshold Failures**:
   ```bash
   # Check if using correct environment:
   🔧 DEV Environment: Expecting slower performance...
   ✗ bootstrap_time 'avg<5000' avg=11920
   ```
   - **Solution**: Thresholds now auto-adjust per environment
   - **Check**: Verify URL detection in environment-config.js

3. **Statistical Inconsistency**:
   ```bash
   # Look for variance warnings:
   Average: 450ms, StdDev: 200ms, CV: 44%
   ✗ state_statistical_consistent: false
   ```
   - **Solution**: Run `regression-statistical` for warmup phase
   - **Check**: System load, close other applications

#### Enhanced Error Messages
- **Detailed stack traces** for JavaScript errors
- **Coefficient of variation analysis** for measurement reliability  
- **Environment detection logs** showing which thresholds are applied
- **Element selection diagnostics** with fallback attempts

#### New Diagnostic Commands
```bash
# Statistical analysis with detailed variance reporting
just regression-statistical dev02

# Quick test with environment-specific diagnostics  
just regression-quick stage

# Micro-benchmarks with enhanced element detection
just regression-micro prod
```

#### Legacy Troubleshooting (Still Applicable)
1. **Browser compatibility**: Chrome/Chromium required
2. **Network access**: Ensure test environments are accessible  
3. **System resources**: Close other applications during testing
4. **Headless mode**: Use `k6_browser_headless=true` for consistency

---

## 🎉 Summary

The regression tests now provide **intelligent, environment-aware performance validation** with:

✅ **Realistic thresholds** per environment (dev/stage/prod)  
✅ **Enhanced diagnostics** with detailed error messages  
✅ **Statistical validation** for reliable performance analysis  
✅ **Robust element selection** with multiple fallback strategies  
✅ **Environment detection** with appropriate performance expectations

These optimized regression tests help ensure your store-to-BehaviorSubject refactor maintains or improves performance while providing actionable insights for optimization.

## Documentation

- [k6: Types of Load Testing](https://grafana.com/load-testing/types-of-load-testing/)
- [k6: Official Tutorial](https://k6.io/docs/examples/tutorials/get-started-with-k6/)
- [k6: More resources](https://k6.io/docs/get-started/resources/)
- [GitHub: k6-learn, a nice Tutorial](https://github.com/grafana/k6-learn/blob/main/Modules/II-k6-Foundations/01-Getting-started-with-k6-OSS.md)
- [youtube: Nice introduction to k6 (Grafana setup comes from here)](https://www.youtube.com/watch?v=Hu1K2ZGJ_K4)
- [Google: Web Vitals](https://web.dev/vitals/)
