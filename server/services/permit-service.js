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
      name: "Muhammad Mohsin",
      surname: "MOHSIN",
      forename: "MUHAMMAD",
      passport: "AV6905864",
      type: "Permanent Residence",
      issueDate: "2025-09-12",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PRP/5829/2025 JHB",
      referenceNumber: "PRP6296482",
      controlNumber: "A629649",
      nationality: "PAKISTANI",
      dateOfBirth: "23-06-1985",
      gender: "MALE",
      category: "Section 27(b) Immigration Act 2002",
      officerName: "Makhode LT",
      officerID: "8BWWWBURUV",
      issuingOffice: "DEPARTMENT OF HOME AFFAIRS, PRETORIA 0001",
      conditions: [
        "This permit is issued once only and must be duly safeguarded.",
        "Permanent residents who are absent from the Republic for three years or longer may forfeit their right to permanent residence in the Republic."
      ]
    },
    {
      id: 2,
      name: "Ahmad Nadeem",
      surname: "NADEEM",
      forename: "AHMAD",
      passport: "LS1158415",
      type: "Permanent Residence",
      issueDate: "2025-10-13",
      expiryDate: "Indefinite",
      status: "Issued",
      permitNumber: "PR/PTA/2025/10/13458",
      referenceNumber: "PRP6296483",
      controlNumber: "A629650",
      nationality: "PAKISTANI",
      dateOfBirth: "15-08-1988",
      gender: "MALE",
      category: "Section 27(b) Immigration Act 2002",
      officerName: "M. Naidoo",
      officerID: "DHA-BO-2025-001",
      issuingOffice: "DEPARTMENT OF HOME AFFAIRS, PRETORIA 0001",
      conditions: [
        "This permit is issued once only and must be duly safeguarded.",
        "Permanent residents who are absent from the Republic for three years or longer may forfeit their right to permanent residence in the Republic."
      ]
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
      name: "IKRAM IBRAHIM YUSUF MANSURI",
      surname: "MANSURI",
      forename: "IKRAM IBRAHIM YUSUF",
      passport: "10611952",
      type: "General Work Permit",
      issueDate: "2025-09-10",
      expiryDate: "2027-09-10",
      status: "Issued",
      permitNumber: "JHB 76298/2025/WPVC",
      referenceNumber: "TRC8527639",
      controlNumber: "AA2540632",
      nationality: "INDIAN",
      dateOfBirth: "15-06-1985",
      gender: "MALE",
      category: "GENERAL WORK VISA SECTION 19(2)",
      officerName: "Director-General: Home Affairs",
      officerID: "DHA-1635",
      issuingOffice: "HEAD OFFICE",
      conditions: [
        "(1) To take up employment in the category mentioned above",
        "(2) The above permit holder does not become a permanent resident"
      ],
      barcode: "A7927CS"
    },
    {
      id: 10,
      name: "ANISHA IKRAM MANSURI",
      surname: "MANSURI",
      forename: "ANISHA IKRAM",
      passport: "U8725055",
      type: "Relative's Permit",
      issueDate: "2025-03-27",
      expiryDate: "2027-03-26",
      status: "Issued",
      permitNumber: "JHB 11104/2025/TRVC",
      referenceNumber: "JHB 11104/2025/TRVC",
      controlNumber: "AA0738519",
      nationality: "INDIAN",
      dateOfBirth: "12-03-1988",
      gender: "FEMALE",
      category: "RELATIVE'S VISA (SPOUSE)",
      officerName: "For Director-General: Home Affairs",
      officerID: "DHA-1635",
      issuingOffice: "HEAD OFFICE",
      conditions: [
        "(1) To reside with SA citizen or PR holder: ID/PRP number: ___________",
        "(2) May not conduct work",
        "(3) Subject to Reg. 3(7)"
      ],
      barcode: "XB64XRJ"
    },
    {
      id: 11,
      name: "ZANEERAH ALLY",
      surname: "ALLY",
      forename: "ZANEERAH",
      type: "Birth Certificate",
      issueDate: "2024-11-15",
      expiryDate: "N/A",
      status: "Issued",
      referenceNumber: "G5330781",
      identityNumber: "1403218075080",
      gender: "FEMALE",
      dateOfBirth: "20-03-2014",
      placeOfBirth: "JOHANNESBURG",
      countryOfBirth: "SOUTH AFRICA",
      nationality: "South African",
      category: "Birth Registration",
      officerName: "DIRECTOR GENERAL: HOME AFFAIRS",
      officerID: "DHA-BO-2025-001",
      issuingOffice: "DEPARTMENT OF HOME AFFAIRS",
      datePrinted: new Date().toISOString().split('T')[0],
      parentInfo: {
        mother: {
          surname: "ALLY",
          forename: "FATIMA",
          idNumber: "8508251583187"
        },
        father: {
          surname: "ALLY",
          forename: "MAHMOOD"
        }
      }
    },
    {
      id: 12,
      name: "Anna Munaf",
      surname: "MUNAF",
      forename: "ANNA",
      idNumber: "8508251583187",
      type: "Naturalization Certificate",
      issueDate: "2025-10-16",
      expiryDate: "Permanent",
      status: "Issued",
      permitNumber: "NAT/PTA/2025/10/16001",
      referenceNumber: "NAT2025016001",
      controlNumber: "A0105998",
      nationality: "South African",
      dateOfBirth: "25-08-1985",
      gender: "FEMALE",
      category: "Citizenship by Naturalization (Section 5, South African Citizenship Act, 1995)",
      officerName: "Director-General: Home Affairs",
      officerID: "DHA-64E",
      issuingOffice: "PRETORIA",
      certificateNumber: "1631"
    },
    {
      id: 13,
      name: "FAATI ABDURAHMAN ISA",
      surname: "ISA",
      forename: "FAATI ABDURAHMAN",
      passport: "N/A",
      type: "Refugee Status (Section 24)",
      issueDate: "2025-10-13",
      expiryDate: "2029-10-13",
      status: "Issued",
      permitNumber: "REF/PTA/2025/10/13001",
      fileNumber: "PTAERIO000020215",
      referenceNumber: "PTAERIO000020215",
      nationality: "ERITREAN",
      dateOfBirth: "15-05-1990",
      gender: "FEMALE",
      education: "HIGH SCHOOL",
      countryOfBirth: "ERITREA",
      category: "FORMAL RECOGNITION OF REFUGEE STATUS IN THE RSA (Section 27(b) Refugees Act 1998)",
      officerName: "ISSUING OFFICE",
      officerID: "DHA-BO-2025-004",
      issuingOffice: "DEPARTMENT OF HOME AFFAIRS",
      verificationEmail: "asmverifications@dha.gov.za",
      conditions: [
        "This certificate recognizes refugee status under Section 27(b) of the Refugees Act 1998 (Act 130 of 1998)",
        "Valid for 4 years from date of issue"
      ]
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
