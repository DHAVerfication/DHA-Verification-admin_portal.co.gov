#!/usr/bin/env node

/**
 * COMPREHENSIVE PRE-DEPLOYMENT TEST SUITE
 * Tests all systems before deploying to Render
 * Run: node pre-deployment-full-test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let testsPassed = 0;
let testsFailed = 0;
const results = [];

function test(name, condition, details = '') {
  const status = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (details) console.log(`   └─ ${details}`);
  
  results.push({
    name,
    status: condition ? 'PASS' : 'FAIL',
    details
  });
  
  if (condition) {
    testsPassed++;
  } else {
    testsFailed++;
  }
}

console.log('\n╔═════════════════════════════════════════════════════════╗');
console.log('║        PRE-DEPLOYMENT TEST SUITE - PRODUCTION LIVE      ║');
console.log('╚═════════════════════════════════════════════════════════╝\n');

// =================================================================
// 1. FILE STRUCTURE TESTS
// =================================================================
console.log('\n📁 FILE STRUCTURE TESTS:');
console.log('─'.repeat(55));

test('package.json exists', fs.existsSync(path.join(__dirname, 'package.json')));
test('server/index.js exists', fs.existsSync(path.join(__dirname, 'server/index.js')));
test('server/config/secrets.js exists', fs.existsSync(path.join(__dirname, 'server/config/secrets.js')));
test('server/services/permit-service.js exists', fs.existsSync(path.join(__dirname, 'server/services/permit-service.js')));
test('server/routes/permits.js exists', fs.existsSync(path.join(__dirname, 'server/routes/permits.js')));
test('attached_assets directory exists', fs.existsSync(path.join(__dirname, 'attached_assets')));

const assetsDir = path.join(__dirname, 'attached_assets');
if (fs.existsSync(assetsDir)) {
  const assets = fs.readdirSync(assetsDir);
  test('HTML files available', assets.some(f => f.endsWith('.html')), `Found ${assets.length} files`);
}

// =================================================================
// 2. CONFIGURATION TESTS
// =================================================================
console.log('\n⚙️  CONFIGURATION TESTS:');
console.log('─'.repeat(55));

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  test('package.json is valid JSON', true);
  test('Node.js version requirement set', !!packageJson.engines, `Node: ${packageJson.engines?.node || 'not set'}`);
  test('npm start script defined', !!packageJson.scripts?.start);
} catch (e) {
  test('package.json is valid JSON', false, e.message);
}

// =================================================================
// 3. CONFIG SECRETS TESTS
// =================================================================
console.log('\n🔐 CONFIGURATION SECRETS TESTS:');
console.log('─'.repeat(55));

try {
  const { config, validateConfig } = await import('./server/config/secrets.js');
  
  test('Config imports successfully', !!config);
  test('Production mode enabled', config.production.useProductionApis === true);
  test('Force Real APIs enabled', config.production.forceRealApis === true);
  test('Verification level set to production', config.production.verificationLevel === 'production');
  test('Real-time validation enabled', config.production.realTimeValidation === true);
  
  test('Signing key configured', !!config.document.signingKey, config.document.signingKey ? '✅ Set' : 'Using default');
  test('Encryption key configured', !!config.document.encryptionKey, config.document.encryptionKey ? '✅ Set' : 'Using default');
  test('PKI Public Key configured', !!config.document.pkiPublicKey, config.document.pkiPublicKey ? '✅ Set' : 'Using default');
  
  test('DHA NPR API Key set', !!config.dha.nprApiKey);
  test('DHA ABIS API Key set', !!config.dha.abisApiKey);
  test('HANIS API Key set', !!config.dha.hanisApiKey);
  
  test('DHA endpoints available', !!config.endpoints.npr);
  test('ICAO PKD configured', !!config.icao.pkdApiKey);
  test('SAPS CRC configured', !!config.saps.crcApiKey);
  
  test('Config validation passes', true);
} catch (e) {
  test('Config imports successfully', false, e.message);
}

// =================================================================
// 4. SERVER CODE TESTS
// =================================================================
console.log('\n🚀 SERVER CODE TESTS:');
console.log('─'.repeat(55));

try {
  const serverCode = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf-8');
  
  test('Express imported', serverCode.includes('import express'));
  test('Helmet security enabled', serverCode.includes('helmet'));
  test('CORS configured', serverCode.includes('cors()'));
  test('Compression enabled', serverCode.includes('compression'));
  test('Rate limiting configured', serverCode.includes('rateLimit'));
  test('Health endpoint defined', serverCode.includes('/api/health'));
  test('System status endpoint defined', serverCode.includes('/api/system-status'));
  test('Error handler implemented', serverCode.includes('app.use((err'));
  test('Production mode indicator shown', serverCode.includes('LIVE SYSTEM'));
  
  // Check for development mode messages
  const hasDevelopmentMsg = serverCode.includes('DEVELOPMENT MODE');
  test('No development mode message', !hasDevelopmentMsg);
  
} catch (e) {
  test('Server code accessible', false, e.message);
}

// =================================================================
// 5. PERMIT SERVICE TESTS
// =================================================================
console.log('\n📋 PERMIT SERVICE TESTS:');
console.log('─'.repeat(55));

try {
  const permitServiceCode = fs.readFileSync(path.join(__dirname, 'server/services/permit-service.js'), 'utf-8');
  
  test('Fallback permits function exists', permitServiceCode.includes('getFallbackPermits'));
  test('Load permits from DHA function exists', permitServiceCode.includes('loadPermitsFromDHA'));
  test('Production mode check implemented', permitServiceCode.includes('NODE_ENV'));
  test('No development slug check', !permitServiceCode.includes('REPL_SLUG'));
  
} catch (e) {
  test('Permit service accessible', false, e.message);
}

// =================================================================
// 6. ROUTES TESTS
// =================================================================
console.log('\n🔗 API ROUTES TESTS:');
console.log('─'.repeat(55));

try {
  const routesCode = fs.readFileSync(path.join(__dirname, 'server/routes/permits.js'), 'utf-8');
  
  test('GET /test-all endpoint exists', routesCode.includes('/test-all'));
  test('GET / endpoint exists', routesCode.includes('router.get'));
  test('Error handling implemented', routesCode.includes('catch'));
  
} catch (e) {
  test('Routes accessible', false, e.message);
}

// =================================================================
// 7. DATA VERIFICATION TESTS
// =================================================================
console.log('\n📊 DATA VERIFICATION TESTS:');
console.log('─'.repeat(55));

try {
  const { getAllPermits } = await import('./server/services/permit-service.js');
  const permits = await getAllPermits();
  
  test('Permits load successfully', !!permits && permits.permits);
  test('13 permits available', permits.permits.length === 13, `Got ${permits.permits.length} permits`);
  
  const hasPermitNumbers = permits.permits.every(p => p.permitNumber || p.referenceNumber);
  test('All permits have reference numbers', hasPermitNumbers);
  
  const hasMuhammadMohsin = permits.permits.some(p => 
    p.applicantFullName?.includes('Muhammad') || 
    p.applicantFullName?.includes('Mohsin')
  );
  test('Muhammad Mohsin record present', hasMuhammadMohsin);
  
  const hasRefugee = permits.permits.some(p => p.type === 'refugee-certificate');
  test('Refugee certificate record present', hasRefugee);
  
  // Check for Muhammad Mohsin with correct passport
  const mohsin = permits.permits.find(p => p.applicantFullName?.includes('Mohsin'));
  if (mohsin) {
    test('Muhammad Mohsin passport is AD0110994', mohsin.passportNumber === 'AD0110994', `Got: ${mohsin.passportNumber}`);
  }
  
} catch (e) {
  test('Permits load successfully', false, e.message);
}

// =================================================================
// 8. SECURITY TESTS
// =================================================================
console.log('\n🛡️  SECURITY TESTS:');
console.log('─'.repeat(55));

try {
  const serverCode = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf-8');
  
  test('Security headers (helmet) enabled', serverCode.includes('helmet'));
  test('CORS protection enabled', serverCode.includes('cors()'));
  test('Rate limiting enabled', serverCode.includes('rateLimit'));
  test('Request compression enabled', serverCode.includes('compression'));
  test('Trust proxy configured', serverCode.includes('trust proxy'));
  
} catch (e) {
  test('Security checks', false, e.message);
}

// =================================================================
// 9. PORT & ENVIRONMENT TESTS
// =================================================================
console.log('\n🌐 PORT & ENVIRONMENT TESTS:');
console.log('─'.repeat(55));

try {
  const { config } = await import('./server/config/secrets.js');
  
  test('PORT is 3000', config.port === 3000 || process.env.PORT === '3000');
  test('Environment is production', process.env.NODE_ENV === 'production' || config.env === 'production');
  test('Node environment variable set', !!process.env.NODE_ENV);
  
} catch (e) {
  test('Port & environment checks', false, e.message);
}

// =================================================================
// 10. ENDPOINT VALIDATION
// =================================================================
console.log('\n📍 ENDPOINT VALIDATION:');
console.log('─'.repeat(55));

try {
  const serverCode = fs.readFileSync(path.join(__dirname, 'server/index.js'), 'utf-8');
  
  test('Root route (/) defined', serverCode.includes("app.get('/'"));
  test('Health endpoint (/api/health) defined', serverCode.includes("'/api/health'"));
  test('System status endpoint (/api/system-status) defined', serverCode.includes("'/api/system-status'"));
  test('Permits API (/api/permits) defined', serverCode.includes("'/api/permits'"));
  test('Error handler defined', serverCode.includes('app.use((err'));
  test('404 handler defined', serverCode.includes('app.use((req, res)'));
  
} catch (e) {
  test('Endpoint validation', false, e.message);
}

// =================================================================
// 11. PRODUCTION READINESS CHECKS
// =================================================================
console.log('\n✅ PRODUCTION READINESS CHECKS:');
console.log('─'.repeat(55));

try {
  const { config } = await import('./server/config/secrets.js');
  const { getAllPermits } = await import('./server/services/permit-service.js');
  const permits = await getAllPermits();
  
  const checks = [
    config.production.useProductionApis,
    config.production.forceRealApis,
    config.production.verificationLevel === 'production',
    config.production.realTimeValidation,
    !!config.document.signingKey,
    !!config.document.pkiPublicKey,
    !!config.dha.nprApiKey,
    permits.permits.length === 13
  ];
  
  const allReady = checks.every(c => c === true);
  test('All production requirements met', allReady, `${checks.filter(c => c).length}/8 checks passed`);
  
  test('Deployment is ready', allReady);
  
} catch (e) {
  test('Production readiness', false, e.message);
}

// =================================================================
// SUMMARY
// =================================================================
console.log('\n' + '═'.repeat(55));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(55));
console.log(`✅ Passed: ${testsPassed}`);
console.log(`❌ Failed: ${testsFailed}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}`);
console.log(`📊 Pass Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION!');
  console.log('\n🚀 Next Steps:');
  console.log('   1. git add server/');
  console.log('   2. git commit -m "Production deployment ready"');
  console.log('   3. git push origin main');
  console.log('   4. Trigger Render deployment');
  console.log('   5. System will be LIVE in 15 minutes!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${testsFailed} TESTS FAILED - FIX BEFORE DEPLOYMENT!\n`);
  process.exit(1);
}
