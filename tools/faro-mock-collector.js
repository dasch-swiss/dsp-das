/**
 * Mock Faro Collector for Local Development
 *
 * This script creates a simple HTTP server that mimics the Faro collector endpoint.
 * It's useful for local development to see what telemetry data is being sent without
 * needing a real Grafana Cloud instance.
 *
 * Usage:
 *   node tools/faro-mock-collector.js
 *
 * Then update your local config.dev.json to point to:
 *   "collectorUrl": "http://localhost:12345/collect"
 */

const http = require('http');

const PORT = 12345;
const HOST = 'localhost';

const server = http.createServer((req, res) => {
  // Handle CORS preflight requests
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Faro-Session-Id');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/collect') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Pretty print the received data
        console.log('\n' + '='.repeat(80));
        console.log('[Faro Mock Collector] Received telemetry data:');
        console.log('Timestamp:', new Date().toISOString());
        console.log('-'.repeat(80));

        // Log different types of data
        if (data.logs && data.logs.length > 0) {
          console.log('LOGS:', JSON.stringify(data.logs, null, 2));
        }
        if (data.exceptions && data.exceptions.length > 0) {
          console.log('EXCEPTIONS:', JSON.stringify(data.exceptions, null, 2));
        }
        if (data.events && data.events.length > 0) {
          console.log('EVENTS:', JSON.stringify(data.events, null, 2));
        }
        if (data.measurements && data.measurements.length > 0) {
          console.log('MEASUREMENTS:', JSON.stringify(data.measurements, null, 2));
        }
        if (data.meta) {
          console.log('META:', JSON.stringify(data.meta, null, 2));
        }

        console.log('='.repeat(80) + '\n');

        // Send success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } catch (error) {
        console.error('[Faro Mock Collector] Error parsing data:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON' }));
      }
    });

    req.on('error', error => {
      console.error('[Faro Mock Collector] Request error:', error);
      res.writeHead(500);
      res.end();
    });
  } else {
    // Handle other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'error', message: 'Not found' }));
  }
});

server.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(80));
  console.log('Faro Mock Collector Server');
  console.log('='.repeat(80));
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log(`Collecting telemetry at http://${HOST}:${PORT}/collect`);
  console.log('\nTo use this collector, update your config.dev.json:');
  console.log(`  "collectorUrl": "http://${HOST}:${PORT}/collect"`);
  console.log('\nPress Ctrl+C to stop the server\n');
  console.log('='.repeat(80) + '\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down Faro Mock Collector...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down Faro Mock Collector...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
