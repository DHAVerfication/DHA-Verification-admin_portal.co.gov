import { generatePermitPDF } from './server/services/document-generator.js';
import fs from 'fs';
import path from 'path';

// Test data for each document type
const testDocuments = [
  {
    type: 'Birth Certificate',
    name: 'Test Child Name',
    surname: 'Test Surname',
    forename: 'Test Forename',
    identityNumber: '0001010000001',
    dateOfBirth: '01/01/2000',
    placeOfBirth: 'Pretoria',
    gender: 'MALE',
    permitNumber: 'BC-2025-00001',
    issueDate: '2025-01-01'
  },
  {
    type: 'Permanent Residence',
    name: 'Muhammad Test',
    surname: 'Test',
    forename: 'Muhammad',
    permitNumber: 'PR/PTA/2025/TEST',
    referenceNumber: 'PR-TEST-001',
    nationality: 'PAKISTANI',
    dateOfBirth: '01/01/1985',
    gender: 'MALE',
    issueDate: '2025-01-01',
    expiryDate: 'PERMANENT',
    passport: 'AB1234567'
  },
  {
    type: 'General Work Permit',
    name: 'Test Worker',
    permitNumber: 'GWP-2025-TEST',
    passport: 'CD7890123',
    nationality: 'ZIMBABWEAN',
    issueDate: '2025-01-01',
    expiryDate: '2027-01-01',
    category: 'General Work'
  },
  {
    type: 'Refugee Status (Section 24)',
    name: 'Test Refugee',
    surname: 'Refugee',
    forename: 'Test',
    permitNumber: 'RS24-2025-TEST',
    referenceNumber: 'REF-TEST-001',
    nationality: 'SOMALIA',
    dateOfBirth: '01/01/1990',
    gender: 'FEMALE',
    issueDate: '2025-01-01',
    expiryDate: '2029-01-01'
  },
  {
    type: 'Refugee Certificate',
    name: 'Test Refugee Certificate',
    permitNumber: 'RC-2025-TEST',
    nationality: 'CONGO',
    issueDate: '2025-01-01'
  },
  {
    type: 'Formal Recognition of Refugee Status',
    name: 'Test Formal Recognition',
    surname: 'Recognition',
    forename: 'Test',
    permitNumber: 'FRRS-2025-TEST',
    nationality: 'BURUNDI',
    dateOfBirth: '01/01/1988',
    gender: 'MALE',
    issueDate: '2025-01-01'
  },
  {
    type: 'Naturalization Certificate',
    name: 'Test Citizen',
    permitNumber: 'NC-2025-TEST',
    issueDate: '2025-01-01'
  },
  {
    type: 'Declaration of Allegiance',
    name: 'Test Declaration',
    permitNumber: 'DA-2025-TEST',
    issueDate: '2025-01-01'
  }
];

async function testAllDocuments() {
  console.log('🧪 Testing PDF Generation for All Document Types\n');
  console.log('='.repeat(60));
  
  const outputDir = 'test-pdfs';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  let successCount = 0;
  let failCount = 0;
  
  for (const doc of testDocuments) {
    try {
      console.log(`\n📄 Generating: ${doc.type}`);
      console.log(`   Permit: ${doc.permitNumber}`);
      
      const pdfBuffer = await generatePermitPDF(doc, { forceTemplate: true });
      const filename = `${doc.type.replace(/[^a-zA-Z0-9]/g, '_')}_test.pdf`;
      const filepath = path.join(outputDir, filename);
      
      fs.writeFileSync(filepath, pdfBuffer);
      
      const stats = fs.statSync(filepath);
      console.log(`   ✅ Success! Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📁 Saved to: ${filepath}`);
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Successful: ${successCount}/${testDocuments.length}`);
  console.log(`   ❌ Failed: ${failCount}/${testDocuments.length}`);
  console.log(`\n📁 PDFs saved in: ./${outputDir}/`);
  
  if (failCount === 0) {
    console.log('\n🎉 All PDF generation tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
}

testAllDocuments().catch(console.error);
