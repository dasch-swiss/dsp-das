#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadK6Results(filePath) {
  const rawData = fs.readFileSync(filePath, 'utf8');
  const lines = rawData.trim().split('\n');
  const results = [];
  
  lines.forEach(line => {
    try {
      const data = JSON.parse(line);
      if (data.type === 'Point' && data.data) {
        results.push(data.data);
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  });
  
  return results;
}

function calculateStats(values) {
  if (values.length === 0) return null;
  
  values.sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const median = values[Math.floor(values.length / 2)];
  const p95 = values[Math.floor(values.length * 0.95)];
  const p99 = values[Math.floor(values.length * 0.99)];
  
  return {
    count: values.length,
    mean: mean.toFixed(2),
    median: median.toFixed(2),
    min: Math.min(...values).toFixed(2),
    max: Math.max(...values).toFixed(2),
    p95: p95.toFixed(2),
    p99: p99.toFixed(2)
  };
}

function compareVersions(ngxsResults, userServiceResults) {
  const comparison = {};
  
  // Group metrics by name
  const ngxsMetrics = {};
  const userServiceMetrics = {};
  
  ngxsResults.forEach(point => {
    const metricName = point.tags?.name || 'unknown';
    if (!ngxsMetrics[metricName]) ngxsMetrics[metricName] = [];
    ngxsMetrics[metricName].push(point.value);
  });
  
  userServiceResults.forEach(point => {
    const metricName = point.tags?.name || 'unknown';
    if (!userServiceMetrics[metricName]) userServiceMetrics[metricName] = [];
    userServiceMetrics[metricName].push(point.value);
  });
  
  // Compare metrics
  const allMetrics = new Set([...Object.keys(ngxsMetrics), ...Object.keys(userServiceMetrics)]);
  
  allMetrics.forEach(metricName => {
    const ngxsValues = ngxsMetrics[metricName] || [];
    const userServiceValues = userServiceMetrics[metricName] || [];
    
    const ngxsStats = calculateStats(ngxsValues);
    const userServiceStats = calculateStats(userServiceValues);
    
    if (ngxsStats && userServiceStats) {
      const improvement = ((parseFloat(ngxsStats.mean) - parseFloat(userServiceStats.mean)) / parseFloat(ngxsStats.mean) * 100);
      
      comparison[metricName] = {
        ngxs: ngxsStats,
        userService: userServiceStats,
        improvement: improvement.toFixed(2) + '%',
        improvedBy: improvement > 0 ? 'UserService faster' : 'NGXS faster',
        improvementValue: improvement
      };
    }
  });
  
  return comparison;
}

function generateReport(comparison) {
  console.log('\\n=== USER SERVICE REFACTOR PERFORMANCE COMPARISON ===\\n');
  console.log('🔄 NGXS → UserService Performance Analysis\\n');
  
  Object.entries(comparison).forEach(([metricName, data]) => {
    const emoji = data.improvementValue > 0 ? '✅' : data.improvementValue < -10 ? '❌' : '⚠️';
    
    console.log(`${emoji} ${metricName.toUpperCase()}`);
    console.log('────────────────────────────────────');
    console.log(`NGXS Mean:        ${data.ngxs.mean}ms`);
    console.log(`UserService Mean: ${data.userService.mean}ms`);
    console.log(`Change:           ${data.improvement} (${data.improvedBy})`);
    console.log(`\\nDetailed Stats:`);
    console.log(`              NGXS      UserService`);
    console.log(`P95:          ${data.ngxs.p95}ms      ${data.userService.p95}ms`);
    console.log(`Median:       ${data.ngxs.median}ms      ${data.userService.median}ms`);
    console.log(`Min/Max:      ${data.ngxs.min}-${data.ngxs.max}ms  ${data.userService.min}-${data.userService.max}ms`);
    console.log('\\n');
  });
  
  // Summary
  const improvements = Object.values(comparison)
    .map(data => data.improvementValue)
    .filter(imp => imp > 0);
  
  const regressions = Object.values(comparison)
    .map(data => data.improvementValue)  
    .filter(imp => imp < 0);
    
  const significantRegressions = regressions.filter(reg => reg < -10);

  console.log('=== REFACTOR IMPACT SUMMARY ===');
  console.log(`✅ Performance Improvements: ${improvements.length} metrics`);
  console.log(`⚠️  Minor Regressions: ${regressions.length - significantRegressions.length} metrics`);
  console.log(`❌ Significant Regressions: ${significantRegressions.length} metrics`);
  
  if (improvements.length > 0) {
    const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
    console.log(`📈 Average improvement: +${avgImprovement.toFixed(1)}% (UserService faster)`);
  }
  
  if (regressions.length > 0) {
    const avgRegression = Math.abs(regressions.reduce((a, b) => a + b, 0) / regressions.length);
    console.log(`📉 Average regression: -${avgRegression.toFixed(1)}% (UserService slower)`);
  }
  
  // Overall assessment
  console.log('\\n=== RECOMMENDATION ===');
  if (significantRegressions.length === 0 && improvements.length > regressions.length) {
    console.log('🎉 ✅ REFACTOR RECOMMENDED: UserService shows net performance improvement');
  } else if (significantRegressions.length > 0) {
    console.log('🚨 ❌ REFACTOR NEEDS WORK: Significant regressions detected');
  } else {
    console.log('🤔 ⚠️  REFACTOR MIXED RESULTS: Review individual metrics for decision');
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node compare-user-service-results.js <ngxs-results.json> <userservice-results.json>');
    console.log('\\nExample:');
    console.log('  node k6/scripts/compare-user-service-results.js results-ngxs.json results-userservice.json');
    process.exit(1);
  }
  
  const ngxsFile = args[0];
  const userServiceFile = args[1];
  
  if (!fs.existsSync(ngxsFile)) {
    console.error(`❌ NGXS results file not found: ${ngxsFile}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(userServiceFile)) {
    console.error(`❌ UserService results file not found: ${userServiceFile}`);
    process.exit(1);
  }
  
  console.log('🔍 Loading performance results...');
  const ngxsResults = loadK6Results(ngxsFile);
  const userServiceResults = loadK6Results(userServiceFile);
  
  console.log(`📊 NGXS results: ${ngxsResults.length} data points`);
  console.log(`📊 UserService results: ${userServiceResults.length} data points`);
  
  if (ngxsResults.length === 0 || userServiceResults.length === 0) {
    console.error('❌ Insufficient data for comparison');
    console.log('💡 Make sure to run tests with --out json=filename.json');
    process.exit(1);
  }
  
  const comparison = compareVersions(ngxsResults, userServiceResults);
  generateReport(comparison);
  
  // Save detailed comparison to file
  const outputFile = `user-service-comparison-${Date.now()}.json`;
  fs.writeFileSync(outputFile, JSON.stringify(comparison, null, 2));
  console.log(`\\n💾 Detailed comparison saved to: ${outputFile}`);
}

if (require.main === module) {
  main();
}

module.exports = { compareVersions, generateReport };