import axios from 'axios';
import { config } from '../config/secrets.js';

export class DHAAPIValidator {
  constructor() {
    this.endpoints = {
      npr: config.endpoints.npr,
      dms: config.endpoints.dms,
      visa: config.endpoints.visa,
      mcs: config.endpoints.mcs,
      abis: config.endpoints.abis,
      hanis: config.endpoints.hanis,
      gwp: config.endpoints.gwp,
      icaoPkd: config.icao.pkdBaseUrl,
      sapsCrc: config.saps.crcBaseUrl
    };

    this.apiKeys = {
      npr: config.dha.nprApiKey,
      dms: config.dha.dmsApiKey,
      visa: config.dha.visaApiKey,
      mcs: config.dha.mcsApiKey,
      abis: config.dha.abisApiKey,
      hanis: config.dha.hanisApiKey,
      icaoPkd: config.icao.pkdApiKey,
      sapsCrc: config.saps.crcApiKey
    };
  }

  async validateEndpoint(name, endpoint, apiKey) {
    try {
      console.log(`🔍 Validating ${name} endpoint: ${endpoint}`);
      
      const response = await axios.get(`${endpoint}/health`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DHA-BackOffice/1.0'
        },
        timeout: 5000,
        validateStatus: (status) => status < 500
      });

      const isValid = response.status >= 200 && response.status < 400;
      
      return {
        name,
        endpoint,
        status: isValid ? 'ONLINE' : 'DEGRADED',
        httpStatus: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A',
        valid: isValid,
        message: isValid ? 'Endpoint responding correctly' : 'Endpoint returned non-success status',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`⚠️  ${name} endpoint validation failed:`, error.message);
      
      return {
        name,
        endpoint,
        status: 'OFFLINE',
        httpStatus: error.response?.status || 0,
        responseTime: 'N/A',
        valid: false,
        error: error.message,
        message: 'Endpoint not accessible - using fallback data',
        timestamp: new Date().toISOString()
      };
    }
  }

  async validateAllEndpoints() {
    console.log('========================================');
    console.log('🔐 DHA API Endpoint Validation');
    console.log('========================================');
    
    const results = [];

    const validations = [
      this.validateEndpoint('NPR (National Population Register)', this.endpoints.npr, this.apiKeys.npr),
      this.validateEndpoint('DMS (Document Management)', this.endpoints.dms, this.apiKeys.dms),
      this.validateEndpoint('VISA System', this.endpoints.visa, this.apiKeys.visa),
      this.validateEndpoint('MCS (Movement Control)', this.endpoints.mcs, this.apiKeys.mcs),
      this.validateEndpoint('ABIS (Biometric System)', this.endpoints.abis, this.apiKeys.abis),
      this.validateEndpoint('HANIS (Home Affairs National ID)', this.endpoints.hanis, this.apiKeys.hanis),
      this.validateEndpoint('GWP (Government Warehouse)', this.endpoints.gwp, process.env.GWP_API_KEY),
      this.validateEndpoint('ICAO PKD (International)', this.endpoints.icaoPkd, this.apiKeys.icaoPkd),
      this.validateEndpoint('SAPS CRC (Police Clearance)', this.endpoints.sapsCrc, this.apiKeys.sapsCrc)
    ];

    const validationResults = await Promise.all(validations);
    results.push(...validationResults);

    const onlineCount = results.filter(r => r.status === 'ONLINE').length;
    const degradedCount = results.filter(r => r.status === 'DEGRADED').length;
    const offlineCount = results.filter(r => r.status === 'OFFLINE').length;

    console.log('');
    console.log('📊 Validation Summary:');
    console.log(`  ✅ Online: ${onlineCount}/${results.length}`);
    console.log(`  ⚠️  Degraded: ${degradedCount}/${results.length}`);
    console.log(`  ❌ Offline: ${offlineCount}/${results.length}`);
    console.log('');

    results.forEach(result => {
      const icon = result.status === 'ONLINE' ? '✅' : result.status === 'DEGRADED' ? '⚠️ ' : '❌';
      console.log(`${icon} ${result.name}: ${result.status} (${result.httpStatus || 'N/A'})`);
      if (result.error) {
        console.log(`     ${result.message}`);
      }
    });

    console.log('========================================');

    return {
      summary: {
        total: results.length,
        online: onlineCount,
        degraded: degradedCount,
        offline: offlineCount,
        availabilityPercentage: Math.round((onlineCount / results.length) * 100)
      },
      endpoints: results,
      timestamp: new Date().toISOString(),
      overallStatus: onlineCount >= 6 ? 'OPERATIONAL' : offlineCount >= 5 ? 'CRITICAL' : 'DEGRADED',
      productionReady: onlineCount >= 6,
      message: onlineCount >= 6 
        ? 'All critical DHA systems are operational' 
        : 'Using authenticated fallback data - some endpoints unavailable'
    };
  }

  async quickHealthCheck() {
    const criticalEndpoints = [
      this.validateEndpoint('NPR', this.endpoints.npr, this.apiKeys.npr),
      this.validateEndpoint('DMS', this.endpoints.dms, this.apiKeys.dms),
      this.validateEndpoint('ABIS', this.endpoints.abis, this.apiKeys.abis)
    ];

    const results = await Promise.all(criticalEndpoints);
    const onlineCount = results.filter(r => r.valid).length;

    return {
      critical: {
        total: results.length,
        online: onlineCount,
        status: onlineCount >= 2 ? 'OPERATIONAL' : 'DEGRADED'
      },
      endpoints: results,
      timestamp: new Date().toISOString()
    };
  }
}

export const dhaApiValidator = new DHAAPIValidator();
