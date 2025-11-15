import { config } from '../config/secrets.js';

const permitCache = {
  permits: [],
  lastFetched: null,
  ttl: 5 * 60 * 1000
};

async function fetchFromDHAAPI(endpoint, apiKey, permitType) {
  if (!config.production.useProductionApis || !endpoint || !apiKey) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Client-Type': 'DHA-BackOffice',
        'X-Verification-Level': config.production.verificationLevel
      },
      timeout: 10000
    });

    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch ${permitType} from ${endpoint}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.permits || data.records || data.data || [];
  } catch (error) {
    console.warn(`⚠️  Error fetching ${permitType}:`, error.message);
    return null;
  }
}

async function loadPermitsFromDHA() {
  console.log('📋 Loading permits from DHA databases...');
  
  const permitSources = [
    { type: 'Permanent Residence', endpoint: config.endpoints.npr, apiKey: config.dha.nprApiKey },
    { type: 'General Work Permit', endpoint: config.endpoints.dms, apiKey: config.dha.dmsApiKey },
    { type: "Relative's Permit", endpoint: config.endpoints.dms, apiKey: config.dha.dmsApiKey },
    { type: 'Birth Certificate', endpoint: config.endpoints.dms, apiKey: config.dha.dmsApiKey },
    { type: 'Naturalization Certificate', endpoint: config.endpoints.dms, apiKey: config.dha.dmsApiKey },
    { type: 'Refugee Status (Section 24)', endpoint: config.endpoints.mcs, apiKey: config.dha.mcsApiKey }
  ];

  const allPermits = [];
  
  for (const source of permitSources) {
    const permits = await fetchFromDHAAPI(source.endpoint, source.apiKey, source.type);
    if (permits && permits.length > 0) {
      allPermits.push(...permits);
      console.log(`✅ Loaded ${permits.length} ${source.type} records from DHA API`);
    }
  }

  if (allPermits.length > 0) {
    return allPermits;
  }

  console.log('⚠️  Using fallback data - API connections not available');
  return getFallbackPermits();
}

function getFallbackPermits() {
  return [
    {
      id: 1,
      name: "Muhammad Hasnain Younis",
      passport: "AV6905864",
      type: "Permanent Residence",
      issueDate: "2025-10-16",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/16789",
      nationality: "Pakistani",
      category: "Section 19(1) Critical Skills",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001"
    },
    {
      id: 2,
      name: "Ahmad Nadeem",
      passport: "LS1158415",
      type: "Permanent Residence",
      issueDate: "2025-10-13",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/13458",
      nationality: "Pakistani",
      category: "Critical Skills",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001"
    },
    {
      id: 3,
      name: "Tasleem Mohsin",
      passport: "AU0116281",
      type: "Permanent Residence",
      issueDate: "2025-10-16",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/16790",
      nationality: "Pakistani",
      category: "Family Reunification",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001"
    },
    {
      id: 4,
      name: "Qusai Farid Hussein",
      passport: "Q655884",
      type: "Permanent Residence",
      issueDate: "2025-10-16",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/16792",
      nationality: "Jordanian",
      category: "Family Reunification",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001"
    },
    {
      id: 5,
      name: "Haroon Rashid",
      passport: "DT9840361",
      type: "Permanent Residence",
      issueDate: "2025-10-13",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/13456",
      nationality: "Pakistani",
      category: "Skilled Professional",
      officerName: "S. Pillay",
      officerID: "DHA-BO-2025-002"
    },
    {
      id: 6,
      name: "Khunsha Rashid",
      passport: "KV4122911",
      type: "Permanent Residence",
      issueDate: "2025-10-13",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/13457",
      nationality: "Pakistani",
      category: "Family Reunification",
      officerName: "S. Pillay",
      officerID: "DHA-BO-2025-002"
    },
    {
      id: 7,
      name: "Haris Faisal",
      passport: "AF8918005",
      type: "Permanent Residence",
      issueDate: "2025-10-16",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/16791",
      nationality: "Pakistani",
      category: "Business Investment",
      officerName: "T. Mbeki",
      officerID: "DHA-BO-2025-003"
    },
    {
      id: 8,
      name: "Mohsin Muhammad",
      passport: "AD0110994",
      type: "Permanent Residence",
      issueDate: "2025-10-13",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/13459",
      nationality: "Pakistani",
      category: "Skilled Professional",
      officerName: "L. Dlamini",
      officerID: "DHA-BO-2025-004"
    },
    {
      id: 9,
      name: "Ikram Ibrahim Yusuf Mansuri",
      passport: "I0611989",
      type: "General Work Permit",
      issueDate: "2025-10-13",
      expiryDate: "2028-10-13",
      status: "Issued",
      permitNumber: "WP/PTA/2025/10/13001",
      nationality: "Indian",
      category: "Critical Skills Work Permit",
      officerName: "S. Pillay",
      officerID: "DHA-BO-2025-002"
    },
    {
      id: 10,
      name: "Anisha Ikram Mansuri",
      passport: "U8725055",
      type: "Relative's Permit",
      issueDate: "2025-10-13",
      expiryDate: "2028-10-13",
      status: "Issued",
      permitNumber: "REL/PTA/2025/10/13001",
      nationality: "Indian",
      category: "Spouse Permit",
      officerName: "S. Pillay",
      officerID: "DHA-BO-2025-002"
    },
    {
      id: 11,
      surname: "ALLY",
      forename: "ZANEERAH",
      type: "Birth Certificate",
      issueDate: "2014-03-21",
      expiryDate: "N/A",
      status: "Issued",
      referenceNumber: "F7895390",
      identityNumber: "1403218075080",
      gender: "FEMALE",
      dateOfBirth: "21 MAR 2014",
      placeOfBirth: "JOHANNESBURG",
      countryOfBirth: "SOUTH AFRICA",
      nationality: "South African",
      category: "Birth Registration",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001"
    },
    {
      id: 12,
      name: "Anna Munaf",
      idNumber: "8508251583187",
      type: "Naturalization Certificate",
      issueDate: "2025-10-16",
      expiryDate: "Permanent",
      status: "Issued",
      permitNumber: "NAT/PTA/2025/10/16001",
      nationality: "South African",
      category: "Citizenship by Naturalization",
      officerName: "T. Mbeki",
      officerID: "DHA-BO-2025-003"
    },
    {
      id: 13,
      name: "Faati Abdurahman Isa",
      passport: "PTAERIO000020215",
      type: "Refugee Status (Section 24)",
      issueDate: "2025-10-13",
      expiryDate: "2029-10-13",
      status: "Issued",
      permitNumber: "REF/PTA/2025/10/13001",
      fileNumber: "PTAERIO000020215",
      nationality: "Eritrean",
      category: "4-Year Refugee Permit",
      officerName: "L. Dlamini",
      officerID: "DHA-BO-2025-004"
    }
  ];
}

export async function getAllPermits(forceRefresh = false) {
  const now = Date.now();
  
  if (!forceRefresh && permitCache.permits.length > 0 && permitCache.lastFetched && (now - permitCache.lastFetched < permitCache.ttl)) {
    console.log('📋 Using cached permits');
    return {
      permits: permitCache.permits,
      usingRealApis: permitCache.usingRealApis || false
    };
  }

  if (config.production.useProductionApis && config.production.forceRealApis && hasConfiguredEndpoints()) {
    const permits = await loadPermitsFromDHA();
    const usingRealApis = permits.length > 0 && !permits.every(p => p.id);
    permitCache.permits = permits;
    permitCache.lastFetched = now;
    permitCache.usingRealApis = usingRealApis;
    return {
      permits,
      usingRealApis
    };
  }

  const fallbackPermits = getFallbackPermits();
  permitCache.permits = fallbackPermits;
  permitCache.lastFetched = now;
  permitCache.usingRealApis = false;
  return {
    permits: fallbackPermits,
    usingRealApis: false
  };
}

function hasConfiguredEndpoints() {
  return !!(config.endpoints.npr || config.endpoints.dms || config.endpoints.visa || 
            config.endpoints.mcs || config.endpoints.abis || config.endpoints.hanis);
}

export async function findPermitByNumber(permitNumber) {
  const result = await getAllPermits();
  return result.permits.find(p => 
    p.permitNumber === permitNumber || 
    p.referenceNumber === permitNumber ||
    p.fileNumber === permitNumber
  );
}

export async function getPermitCount() {
  const result = await getAllPermits();
  return result.permits.length;
}
