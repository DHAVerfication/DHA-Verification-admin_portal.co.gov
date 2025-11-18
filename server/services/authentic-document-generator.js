import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
import { config } from '../config/secrets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');
const ASSETS_DIR = path.join(PROJECT_ROOT, 'attached_assets');

function getChromiumPath() {
  try {
    const chromiumPath = execSync('which chromium', { encoding: 'utf-8' }).trim();
    if (chromiumPath && fs.existsSync(chromiumPath)) {
      return chromiumPath;
    }
  } catch (error) {
    console.warn('Could not find system chromium');
  }
  return null;
}

function getCoatOfArmsBase64() {
  try {
    const coatOfArmsPath = path.join(ASSETS_DIR, 'coat-of-arms-official.png');
    if (fs.existsSync(coatOfArmsPath)) {
      const imageBuffer = fs.readFileSync(coatOfArmsPath);
      return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading coat of arms:', error);
  }
  return null;
}

async function generateDocumentHTML(applicant, documentType) {
  const coatOfArms = getCoatOfArmsBase64();
  
  switch (documentType) {
    case 'Permanent Residence':
      return generatePermanentResidenceHTML(applicant, coatOfArms);
    case 'General Work Permit':
      return generateWorkPermitHTML(applicant, coatOfArms);
    case "Relative's Permit":
      return generateRelativePermitHTML(applicant, coatOfArms);
    case 'Birth Certificate':
      return generateBirthCertificateHTML(applicant, coatOfArms);
    case 'Naturalization Certificate':
      return generateNaturalizationHTML(applicant, coatOfArms);
    case 'Refugee Status (Section 24)':
      return generateRefugeeHTML(applicant, coatOfArms);
    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }
}

function generateGuillocheSVG() {
  return `
    <svg class="guilloche-pattern" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <pattern id="guillocheLines" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0,40 Q20,10 40,40 T80,40" stroke="#006633" stroke-width="0.8" fill="none" opacity="0.3"/>
          <path d="M0,40 Q20,70 40,40 T80,40" stroke="#006633" stroke-width="0.8" fill="none" opacity="0.3"/>
          <circle cx="40" cy="40" r="25" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
          <circle cx="40" cy="40" r="15" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
        </pattern>
        <pattern id="microtext" x="0" y="0" width="300" height="15" patternUnits="userSpaceOnUse">
          <text x="0" y="12" font-size="8px" fill="#006633" opacity="0.5">RSA•DHA•SECURE•DOCUMENT•RSA•DHA•SECURE•DOCUMENT•</text>
        </pattern>
        <pattern id="securityThread" x="0" y="0" width="8" height="15" patternUnits="userSpaceOnUse">
          <rect width="4" height="15" fill="#FFD700" opacity="0.6"/>
        </pattern>
        <linearGradient id="hologramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#00ff00;stop-opacity:0.15" />
          <stop offset="33%" style="stop-color:#00ffff;stop-opacity:0.15" />
          <stop offset="66%" style="stop-color:#ff00ff;stop-opacity:0.15" />
          <stop offset="100%" style="stop-color:#ffff00;stop-opacity:0.15" />
        </linearGradient>
        <radialGradient id="rosetteGrad" cx="50%" cy="50%">
          <stop offset="0%" style="stop-color:#006633;stop-opacity:0.08" />
          <stop offset="100%" style="stop-color:#006633;stop-opacity:0.03" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#guillocheLines)"/>
      <rect x="0" y="0" width="800" height="15" fill="url(#microtext)"/>
      <rect x="0" y="585" width="800" height="15" fill="url(#microtext)"/>
      <rect x="70" y="0" width="8" height="600" fill="url(#securityThread)"/>
      <rect x="720" y="0" width="8" height="600" fill="url(#securityThread)"/>
      <circle cx="150" cy="300" r="100" fill="url(#rosetteGrad)"/>
      <circle cx="150" cy="300" r="90" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <circle cx="150" cy="300" r="80" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <circle cx="150" cy="300" r="70" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <circle cx="650" cy="300" r="100" fill="url(#rosetteGrad)"/>
      <circle cx="650" cy="300" r="90" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <circle cx="650" cy="300" r="80" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <circle cx="650" cy="300" r="70" fill="none" stroke="#006633" stroke-width="0.5" opacity="0.2"/>
      <rect x="650" y="30" width="130" height="60" fill="url(#hologramGrad)" opacity="0.7" rx="8"/>
    </svg>
  `;
}

function generatePermanentResidenceHTML(applicant, coatOfArms) {
  const qrData = `VERIFY:${applicant.permitNumber}|${applicant.passport}|DHA`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #f0ebe3 0%, #e8e1d5 50%, #dfd8c8 100%);
      padding: 40px;
      position: relative;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.6;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      color: rgba(0, 102, 51, 0.08);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
      letter-spacing: 20px;
    }
    .document {
      position: relative;
      z-index: 1;
      background: linear-gradient(to bottom, rgba(255,253,248,0.98) 0%, rgba(252,250,245,0.95) 100%);
      padding: 50px;
      border: 4px solid #006633;
      box-shadow: 0 15px 40px rgba(0,0,0,0.25), inset 0 0 60px rgba(0,102,51,0.03);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      border-bottom: 2px solid #006633;
      padding-bottom: 20px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .coat-of-arms {
      width: 80px;
      height: 80px;
    }
    .dept-info {
      text-align: left;
    }
    .dept-title {
      font-size: 11px;
      color: #006633;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .dept-name {
      font-size: 14px;
      color: #006633;
      font-weight: bold;
      margin-bottom: 2px;
    }
    .country-name {
      font-size: 10px;
      color: #333;
      font-weight: bold;
    }
    .form-number {
      font-size: 11px;
      color: #333;
      font-weight: bold;
      text-align: right;
    }
    .title {
      text-align: center;
      margin: 30px 0;
    }
    .main-title {
      font-size: 22px;
      font-weight: bold;
      color: #006633;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .sub-title {
      font-size: 12px;
      color: #333;
      margin-bottom: 40px;
    }
    .permit-numbers {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 15px;
      border-bottom: 1px solid #ccc;
    }
    .field-group {
      flex: 1;
    }
    .field-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 3px;
      font-weight: bold;
    }
    .field-value {
      font-size: 11px;
      color: #000;
      font-weight: bold;
      padding: 5px 0;
      border-bottom: 1px solid #000;
    }
    .legal-text {
      font-size: 10px;
      line-height: 1.6;
      margin: 25px 0;
      text-align: justify;
    }
    .personal-info {
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      gap: 20px;
      margin-bottom: 15px;
    }
    .info-field {
      flex: 1;
    }
    .signature-section {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
    }
    .signature-block {
      flex: 1;
    }
    .signature-line {
      border-bottom: 1px solid #000;
      margin-bottom: 5px;
      height: 60px;
      position: relative;
    }
    .signature-text {
      position: absolute;
      bottom: 10px;
      left: 10px;
      font-family: 'Brush Script MT', cursive;
      font-size: 24px;
      color: #000080;
    }
    .signature-label {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
    .office-stamp {
      border: 2px solid #cc0000;
      padding: 10px;
      text-align: center;
      color: #cc0000;
      font-size: 12px;
      font-weight: bold;
      line-height: 1.4;
      max-width: 200px;
    }
    .conditions {
      margin-top: 30px;
      font-size: 12px;
      line-height: 1.6;
    }
    .conditions-title {
      font-weight: bold;
      margin-bottom: 10px;
      font-size: 10px;
    }
    .condition-item {
      margin-bottom: 8px;
      padding-left: 15px;
      text-indent: -15px;
    }
    .barcode-section {
      margin-top: 30px;
      text-align: right;
    }
    .control-number {
      font-size: 10px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .barcode-placeholder {
      width: 150px;
      height: 40px;
      background: #000;
      float: right;
      position: relative;
    }
    .barcode-text {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 10px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">REPUBLIC OF SOUTH AFRICA</div>
  <div class="document">
    <div class="header">
      <div class="logo-section">
        ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
        <div class="dept-info">
          <div class="dept-title">home affairs</div>
          <div class="dept-name">Department:<br>Home Affairs</div>
          <div class="country-name">REPUBLIC OF SOUTH AFRICA</div>
        </div>
      </div>
      <div class="form-number">DHA-802</div>
    </div>

    <div class="title">
      <div class="main-title">PERMANENT RESIDENCE PERMIT</div>
      <div class="sub-title">SECTIONS 26 AND 27 OF ACT NO. 13 OF 2002</div>
    </div>

    <div class="permit-numbers">
      <div class="field-group">
        <div class="field-label">PERMIT NUMBER</div>
        <div class="field-value">${applicant.permitNumber || ''}</div>
      </div>
      <div class="field-group" style="margin-left: 40px;">
        <div class="field-label">REFERENCE NO</div>
        <div class="field-value">${applicant.referenceNumber || ''}</div>
      </div>
    </div>

    <div class="legal-text">
      In terms of the provisions of section 27(b) of the Immigration Act, 2002 (Act No. 13 of 2002),
    </div>

    <div class="personal-info">
      <div class="info-row">
        <div class="info-field">
          <div class="field-label">Surname</div>
          <div class="field-value">${applicant.surname || applicant.name || ''}</div>
        </div>
      </div>
      
      <div class="info-row">
        <div class="info-field">
          <div class="field-label">Maiden Surname</div>
          <div class="field-value"></div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-field">
          <div class="field-label">First Name (s)</div>
          <div class="field-value">${applicant.forename || ''}</div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-field">
          <div class="field-label">Nationality</div>
          <div class="field-value">${applicant.nationality || ''}</div>
        </div>
      </div>

      <div class="info-row">
        <div class="info-field">
          <div class="field-label">Date of birth</div>
          <div class="field-value">${applicant.dateOfBirth || ''}</div>
        </div>
        <div class="info-field" style="margin-left: 40px;">
          <div class="field-label">Gender</div>
          <div class="field-value">${applicant.gender || ''}</div>
        </div>
      </div>
    </div>

    <div class="legal-text">
      has been authorised to enter the Republic of South Africa for the purpose of taking up permanent residence, or if he/she on
      the date of approval of application, already sojourns therein legally, to reside permanently. Unless the holder of this permit
      enters the Republic of South Africa for the purpose of permanent residence
      before or on <strong>${applicant.expiryDate || 'N/A'}</strong> the permanent residence permit shall lapse.
    </div>

    <div class="signature-section">
      <div class="signature-block">
        <div class="field-label">Date of issue</div>
        <div class="field-value">${applicant.issueDate || ''}</div>
        <div class="signature-line">
          <div class="signature-text">Makhode</div>
        </div>
        <div class="signature-label">Makhode LT<br>Surname and Initials</div>
      </div>
      <div class="signature-block" style="max-width: 200px;">
        <div class="office-stamp">
          Office stamp<br>
          DEPARTMENT OF HOME AFFAIRS<br>
          <strong>PRIVATE BAG X114</strong><br>
          <br>
          <strong>PRETORIA 0001</strong><br>
          <br>
          <strong>07</strong>
        </div>
      </div>
    </div>

    <div class="signature-section" style="border-top: none; padding-top: 10px;">
      <div class="signature-block">
        <div class="field-label">Date printed</div>
        <div class="field-value">${new Date().toISOString().split('T')[0]}</div>
      </div>
      <div class="signature-block" style="margin-left: 40px;">
        <div class="field-label">Printed by: (system code)</div>
        <div class="field-value"></div>
      </div>
    </div>

    <div class="conditions">
      <div class="conditions-title">Conditions</div>
      <div class="condition-item">1. This permit is issued once only and must be duly safeguarded.</div>
      <div class="condition-item">2. (ii) Permanent residents who are absent from the Republic for three years or longer may lose their right to permanent
      residence in the Republic. A period of absence may only be interrupted by an admission and sojourn in the Republic.</div>
    </div>

    <div class="barcode-section">
      <div class="control-number">Control Number</div>
      <div class="barcode-placeholder">
        <div class="barcode-text">No. ${applicant.controlNumber || 'A'}</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateWorkPermitHTML(applicant, coatOfArms) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A6 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, 
        #e8f5e9 0%, 
        #fff9c4 15%,
        #ffe082 30%,
        #ffcc80 45%,
        #ff8a65 60%,
        #f48fb1 75%,
        #ce93d8 85%,
        #a5d6a7 100%);
      padding: 15px;
      position: relative;
      width: 105mm;
      height: 148mm;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.6;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(46, 125, 50, 0.08);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
    }
    .document {
      background: linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(250,255,250,0.92) 100%);
      padding: 15px;
      border: 2px solid #2e7d32;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3), inset 0 0 40px rgba(46,125,50,0.05);
      position: relative;
      z-index: 1;
      height: 100%;
    }
    .content {
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .coat-of-arms {
      width: 60px;
      height: 60px;
    }
    .dept-info {
      text-align: left;
    }
    .dept-title {
      font-size: 11px;
      color: #2e7d32;
      font-weight: bold;
    }
    .country-name {
      font-size: 10px;
      color: #333;
    }
    .control-info {
      text-align: right;
      font-size: 12px;
    }
    .control-number {
      font-weight: bold;
      margin-bottom: 3px;
    }
    .title {
      text-align: center;
      margin: 15px 0;
    }
    .main-title {
      font-size: 18px;
      font-weight: bold;
      color: #2e7d32;
      margin-bottom: 5px;
    }
    .ref-number {
      font-size: 11px;
      color: #666;
      margin-bottom: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
      margin: 15px 0;
    }
    .info-item {
      font-size: 12px;
    }
    .info-label {
      color: #666;
      margin-bottom: 2px;
    }
    .info-value {
      font-weight: bold;
      color: #000;
    }
    .visa-dates {
      margin: 10px 0;
      font-size: 12px;
    }
    .date-item {
      margin-bottom: 5px;
    }
    .conditions {
      margin-top: 15px;
      font-size: 11px;
      line-height: 1.5;
    }
    .signature {
      margin-top: 15px;
      font-size: 11px;
      font-style: italic;
    }
    .barcode {
      text-align: right;
      margin-top: 10px;
      font-weight: bold;
      font-size: 14px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">WORK PERMIT</div>
  <div class="document">
    <div class="content">
      <div class="header">
        <div class="logo-section">
          ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
          <div class="dept-info">
            <div class="dept-title">home affairs</div>
            <div class="dept-title">Department:<br>Home Affairs</div>
            <div class="country-name">REPUBLIC OF SOUTH AFRICA</div>
          </div>
        </div>
        <div class="control-info">
          <div class="control-number">Control No. ${applicant.controlNumber || ''}</div>
          <div>${applicant.officerID || 'DHA-1635'}</div>
        </div>
      </div>

      <div class="title">
        <div class="main-title">GENERAL WORK PERMIT 19(2)</div>
        <div class="ref-number">${applicant.referenceNumber || ''}</div>
        <div class="ref-number">Ref No: ${applicant.permitNumber || ''}</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Name:</div>
          <div class="info-value">${applicant.name || ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Passport No:</div>
          <div class="info-value">${applicant.passport || ''}</div>
        </div>
      </div>

      <div class="visa-dates">
        <div class="date-item"><strong>VISA Expiry Date:</strong> ${applicant.expiryDate || ''}</div>
        <div class="date-item"><strong>On:</strong> ${applicant.issueDate || ''}</div>
      </div>

      <div class="conditions">
        <div><strong>Conditions:</strong></div>
        <div style="margin-top: 10px;">
          ${(applicant.conditions || []).map((cond, i) => `<div style="margin-bottom: 5px;">${cond}</div>`).join('')}
        </div>
      </div>

      <div class="signature">
        ${applicant.officerName || 'Director-General: Home Affairs'}
      </div>

      <div class="barcode">
        ${applicant.barcode || ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateRelativePermitHTML(applicant, coatOfArms) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A6 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 50%, #81d4fa 100%);
      padding: 15px;
      position: relative;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.25;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 36px;
      color: rgba(1, 87, 155, 0.04);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
    }
    .document {
      background: linear-gradient(to bottom, rgba(255,255,255,0.98) 0%, rgba(250,252,255,0.95) 100%);
      padding: 20px;
      border: 3px solid #0277bd;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25), inset 0 0 40px rgba(2,119,189,0.03);
      position: relative;
      z-index: 1;
      position: relative;
      overflow: hidden;
    }
    .background-pattern {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(3, 169, 244, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .coat-of-arms {
      width: 60px;
      height: 60px;
    }
    .dept-info {
      text-align: left;
    }
    .dept-title {
      font-size: 12px;
      color: #0277bd;
      font-weight: bold;
    }
    .country-name {
      font-size: 11px;
      color: #333;
    }
    .control-info {
      text-align: right;
      font-size: 10px;
    }
    .title {
      text-align: center;
      margin: 20px 0;
    }
    .main-title {
      font-size: 16px;
      font-weight: bold;
      color: #0277bd;
      margin-bottom: 5px;
    }
    .ref-number {
      font-size: 12px;
      color: #666;
      margin-bottom: 3px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-item {
      font-size: 10px;
    }
    .info-label {
      color: #666;
      margin-bottom: 3px;
    }
    .info-value {
      font-weight: bold;
      color: #000;
    }
    .conditions {
      margin-top: 20px;
      font-size: 12px;
      line-height: 1.5;
    }
    .signature {
      margin-top: 20px;
      font-size: 12px;
      font-style: italic;
    }
    .barcode {
      text-align: right;
      margin-top: 15px;
      font-weight: bold;
      font-size: 12px;
      font-family: 'Courier New', monospace;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">RELATIVE'S PERMIT</div>
  <div class="document">
    <div class="content">
      <div class="header">
        <div class="logo-section">
          ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
          <div class="dept-info">
            <div class="dept-title">home affairs</div>
            <div class="dept-title">Department:<br>Home Affairs</div>
            <div class="country-name">REPUBLIC OF SOUTH AFRICA</div>
          </div>
        </div>
        <div class="control-info">
          <div class="control-number">Control No. ${applicant.controlNumber || ''}</div>
          <div>${applicant.officerID || 'DHA-1635'}</div>
        </div>
      </div>

      <div class="title">
        <div class="main-title">RELATIVE'S VISA (SPOUSE)</div>
        <div class="ref-number">Ref No: ${applicant.permitNumber || ''}</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Name:</div>
          <div class="info-value">${applicant.name || ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Passport No:</div>
          <div class="info-value">${applicant.passport || ''}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">No. of Entries:</div>
          <div class="info-value">MULTIPLE</div>
        </div>
        <div class="info-item">
          <div class="info-label">VISA Expiry Date:</div>
          <div class="info-value">${applicant.expiryDate || ''}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Issued at:</div>
          <div class="info-value">${applicant.issuingOffice || 'HEAD OFFICE'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Valid From:</div>
          <div class="info-value">${applicant.issueDate || ''}</div>
        </div>
      </div>

      <div class="conditions">
        <div><strong>Conditions:</strong></div>
        <div style="margin-top: 10px;">
          ${(applicant.conditions || []).map((cond, i) => `<div style="margin-bottom: 5px;">${cond}</div>`).join('')}
        </div>
      </div>

      <div class="signature">
        for Director-General: Home Affairs
      </div>

      <div class="barcode">
        ${applicant.barcode || ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateBirthCertificateHTML(applicant, coatOfArms) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A5 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%);
      padding: 25px;
      position: relative;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.3;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 60px;
      color: rgba(123, 31, 162, 0.04);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
    }
    .document {
      background: linear-gradient(to bottom, rgba(255,252,254,0.98) 0%, rgba(254,250,252,0.95) 100%);
      padding: 35px;
      border: 4px solid #c2185b;
      box-shadow: 0 12px 35px rgba(0,0,0,0.25), inset 0 0 50px rgba(194,24,91,0.03);
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #7b1fa2;
    }
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .coat-of-arms {
      width: 70px;
      height: 70px;
    }
    .dept-info {
      text-align: left;
    }
    .dept-title {
      font-size: 10px;
      color: #7b1fa2;
      font-weight: bold;
    }
    .ref-number {
      font-size: 11px;
      font-weight: bold;
      text-align: right;
    }
    .title {
      text-align: center;
      margin: 30px 0;
      font-size: 24px;
      font-weight: bold;
      color: #7b1fa2;
      letter-spacing: 2px;
    }
    .sub-title {
      text-align: center;
      font-size: 11px;
      color: #666;
      margin-bottom: 30px;
    }
    .info-section {
      margin: 20px 0;
    }
    .info-row {
      display: flex;
      margin-bottom: 15px;
      font-size: 11px;
    }
    .info-label {
      width: 200px;
      color: #666;
      text-transform: uppercase;
      font-size: 12px;
    }
    .info-value {
      flex: 1;
      font-weight: bold;
      color: #000;
      border-bottom: 1px dotted #ccc;
      padding-bottom: 3px;
    }
    .stamp-section {
      margin-top: 40px;
      text-align: right;
    }
    .stamp-box {
      display: inline-block;
      border: 2px solid #7b1fa2;
      padding: 15px;
      text-align: center;
    }
    .stamp-date {
      font-size: 12px;
      font-weight: bold;
      color: #7b1fa2;
    }
    .stamp-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">BIRTH CERTIFICATE</div>
  <div class="document">
    <div class="header">
      <div class="logo-section">
        ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
        <div class="dept-info">
          <div class="dept-title">home affairs</div>
          <div class="dept-title">Department:<br>Home Affairs</div>
          <div class="country-name">REPUBLIC OF SOUTH AFRICA</div>
        </div>
      </div>
      <div class="ref-number">
        ${applicant.referenceNumber || ''}
      </div>
    </div>

    <div class="title">BIRTH CERTIFICATE</div>
    <div class="sub-title">PARTICULARS FROM THE POPULATION REGISTER (R.I.)</div>

    <div class="info-section">
      <div class="info-row">
        <div class="info-label">CHILD SURNAME:</div>
        <div class="info-value">${applicant.surname || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">CHILD FORENAME(S):</div>
        <div class="info-value">${applicant.forename || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">IDENTITY NUMBER:</div>
        <div class="info-value">${applicant.identityNumber || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">DATE OF BIRTH:</div>
        <div class="info-value">${applicant.dateOfBirth || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">GENDER:</div>
        <div class="info-value">${applicant.gender || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">COUNTRY OF BIRTH:</div>
        <div class="info-value">${applicant.countryOfBirth || 'SOUTH AFRICA'}</div>
      </div>
    </div>

    <div class="info-section" style="margin-top: 30px;">
      <div class="info-row">
        <div class="info-label">MOTHER/SURNAME:</div>
        <div class="info-value">${applicant.parentInfo?.mother?.surname || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">MOTHER/FORENAME(S):</div>
        <div class="info-value">${applicant.parentInfo?.mother?.forename || ''}</div>
      </div>
    </div>

    <div class="info-section" style="margin-top: 20px;">
      <div class="info-row">
        <div class="info-label">FATHER/SURNAME:</div>
        <div class="info-value">${applicant.parentInfo?.father?.surname || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">FATHER/FORENAME(S):</div>
        <div class="info-value">${applicant.parentInfo?.father?.forename || ''}</div>
      </div>
    </div>

    <div class="stamp-section">
      <div class="stamp-box">
        <div class="stamp-date">${applicant.datePrinted || new Date().toLocaleDateString('en-GB')}</div>
        <div class="stamp-label">OFFICIAL DATE STAMP</div>
      </div>
    </div>

    <div class="footer">
      DIRECTOR GENERAL: HOME AFFAIRS<br>
      DATE PRINTED: ${applicant.datePrinted || new Date().toLocaleDateString('en-GB')}
    </div>
  </div>
</body>
</html>
  `;
}

function generateNaturalizationHTML(applicant, coatOfArms) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #fff9e6 0%, #ffecb3 50%, #ffe082 100%);
      padding: 40px;
      position: relative;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.35;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 110px;
      color: rgba(255, 111, 0, 0.04);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
    }
    .document {
      background: linear-gradient(to bottom, rgba(255,254,250,0.98) 0%, rgba(254,252,247,0.95) 100%);
      padding: 50px;
      border: 5px double #f57c00;
      box-shadow: 0 18px 45px rgba(0,0,0,0.3), inset 0 0 70px rgba(245,124,0,0.03);
      position: relative;
      z-index: 1;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #ff6f00;
    }
    .coat-of-arms {
      width: 100px;
      height: 100px;
      margin: 0 auto 15px;
      display: block;
    }
    .dept-title {
      font-size: 12px;
      color: #ff6f00;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .title {
      text-align: center;
      margin: 40px 0;
      font-size: 28px;
      font-weight: bold;
      color: #ff6f00;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .certificate-text {
      text-align: center;
      font-size: 14px;
      line-height: 2;
      margin: 30px 0;
    }
    .honorific {
      font-style: italic;
      font-size: 12px;
    }
    .name-field {
      font-size: 20px;
      font-weight: bold;
      color: #000;
      text-decoration: underline;
      margin: 10px 0;
    }
    .info-grid {
      margin: 30px 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .info-item {
      font-size: 11px;
    }
    .info-label {
      color: #666;
      margin-bottom: 5px;
      text-transform: uppercase;
      font-size: 12px;
    }
    .info-value {
      font-weight: bold;
      color: #000;
      font-size: 12px;
    }
    .signature-section {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature-block {
      text-align: center;
    }
    .signature-line {
      width: 200px;
      border-bottom: 1px solid #000;
      margin: 40px 0 10px;
    }
    .seal {
      width: 100px;
      height: 100px;
      border: 3px solid #ff6f00;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      text-align: center;
      margin: 0 auto;
      color: #ff6f00;
      font-weight: bold;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">NATURALIZATION</div>
  <div class="document">
    <div class="header">
      ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
      <div class="dept-title">DEPARTMENT OF HOME AFFAIRS</div>
      <div class="dept-title">REPUBLIC OF SOUTH AFRICA</div>
    </div>

    <div class="title">CERTIFICATE OF NATURALIZATION</div>

    <div class="certificate-text">
      <div class="honorific">This is to certify that</div>
      <div class="name-field">${applicant.name || ''}</div>
      <div class="honorific">has been granted South African Citizenship</div>
      <div class="honorific">by naturalization in accordance with</div>
      <div class="honorific">Section 5 of the South African Citizenship Act, 1995</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Certificate Number:</div>
        <div class="info-value">${applicant.certificateNumber || ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">ID Number:</div>
        <div class="info-value">${applicant.idNumber || ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date of Birth:</div>
        <div class="info-value">${applicant.dateOfBirth || ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Gender:</div>
        <div class="info-value">${applicant.gender || ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date of Issue:</div>
        <div class="info-value">${applicant.issueDate || ''}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Issuing Office:</div>
        <div class="info-value">${applicant.issuingOffice || 'PRETORIA'}</div>
      </div>
    </div>

    <div class="signature-section">
      <div class="signature-block">
        <div class="seal">
          OFFICIAL<br>SEAL<br>DHA
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-line"></div>
        <div style="font-size: 10px;">Director-General: Home Affairs</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateRefugeeHTML(applicant, coatOfArms) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%);
      padding: 40px;
      position: relative;
    }
    .guilloche-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      opacity: 0.3;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(194, 24, 91, 0.04);
      font-weight: bold;
      z-index: 0;
      white-space: nowrap;
    }
    .document {
      background: linear-gradient(to bottom, rgba(255,252,253,0.98) 0%, rgba(254,250,251,0.95) 100%);
      padding: 40px;
      border: 4px solid #c2185b;
      box-shadow: 0 15px 40px rgba(0,0,0,0.25), inset 0 0 60px rgba(194,24,91,0.03);
      position: relative;
      z-index: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #c2185b;
    }
    .left-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .coat-of-arms {
      width: 70px;
      height: 70px;
    }
    .dept-info {
      text-align: left;
    }
    .dept-title {
      font-size: 10px;
      color: #c2185b;
      font-weight: bold;
      line-height: 1.3;
    }
    .barcode {
      text-align: right;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 10px;
    }
    .title {
      text-align: center;
      margin: 25px 0;
    }
    .main-title {
      font-size: 14px;
      font-weight: bold;
      color: #c2185b;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .sub-title {
      font-size: 11px;
      color: #666;
      margin-bottom: 5px;
    }
    .info-section {
      margin: 20px 0;
      font-size: 10px;
    }
    .info-row {
      display: flex;
      margin-bottom: 12px;
    }
    .info-label {
      width: 150px;
      color: #666;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: bold;
    }
    .info-value {
      flex: 1;
      font-weight: bold;
      color: #000;
    }
    .legal-text {
      font-size: 12px;
      line-height: 1.6;
      margin: 20px 0;
      text-align: justify;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ccc;
    }
    .office-section {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-size: 12px;
    }
    .verification-text {
      text-align: center;
      margin-top: 25px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  ${generateGuillocheSVG()}
  <div class="watermark">REFUGEE STATUS</div>
  <div class="document">
    <div class="header">
      <div class="left-section">
        ${coatOfArms ? `<img src="${coatOfArms}" alt="Coat of Arms" class="coat-of-arms">` : ''}
        <div class="dept-info">
          <div class="dept-title">REPUBLIC OF SOUTH AFRICA</div>
          <div class="dept-title">DEPARTMENT HOME AFFAIRS</div>
          <div class="dept-title">REFUGEES ACT 1998 (ACT 130 OF 1998)</div>
        </div>
      </div>
      <div class="barcode">${applicant.fileNumber || ''}</div>
    </div>

    <div class="title">
      <div class="main-title">FORMAL RECOGNITION OF REFUGEE STATUS IN THE RSA</div>
      <div class="sub-title">PARTICULARS OF RECOGNISED REFUGEE IN THE RSA</div>
    </div>

    <div class="info-section">
      <div class="info-row">
        <div class="info-label">NAME AND SURNAME:</div>
        <div class="info-value">${applicant.name || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">GENDER:</div>
        <div class="info-value">${applicant.gender || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">DATE OF BIRTH:</div>
        <div class="info-value">${applicant.dateOfBirth || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">COUNTRY OF BIRTH:</div>
        <div class="info-value">${applicant.countryOfBirth || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">NATIONALITY:</div>
        <div class="info-value">${applicant.nationality || ''}</div>
      </div>
      <div class="info-row">
        <div class="info-label">MARITAL STATUS:</div>
        <div class="info-value">MARRIED</div>
      </div>
    </div>

    <div class="legal-text">
      It is hereby certified that the person whose particulars appear above has, in terms of section 27 (b) of the Refugees Act 1998
      (Act 130 of 1998), been granted status as a refugee in the Republic of South Africa (RSA) from ${applicant.issueDate || ''} to ${applicant.expiryDate || ''}.
      The holder of the Certificate out of the RSA may permanently leave the Republic. The Refugee shall either
      10 days of arrival hereof notify the Refugee Identity Document or the RSA. The holder of this certificate is entitled to those concerned
      rights as provided for in Chapter 3 of the Constitution providing upon and study in RSA.
    </div>

    <div class="footer">
      <div style="font-weight: bold; margin-bottom: 15px;">Cape Town</div>
      
      <div class="office-section">
        <div>
          <div style="margin-bottom: 8px;"><strong>RR/ DIRECTORATE/REFUGEE</strong></div>
          <div>DATE: ${applicant.issueDate || ''}</div>
          <div>DEPARTMENT OF HOME AFFAIRS</div>
        </div>
        <div style="text-align: right;">
          <div style="margin-bottom: 8px;"><strong>${applicant.officerName || 'ISSUING OFFICE'}</strong></div>
        </div>
      </div>

      <div class="office-section" style="margin-top: 25px;">
        <div>
          <div><strong>PLACE:</strong> Cape Town</div>
          <div><strong>DATE:</strong> ${applicant.issueDate || ''}</div>
          <div><strong>REFUGEE RECEPTION OFFICER</strong></div>
        </div>
        <div style="text-align: right;">
          <div><strong>NAME:</strong> Sim Mhlengwa</div>
          <div><strong>VERIFICATION OFFICER</strong> ${applicant.officerID || ''}</div>
          <div><strong>DATE:</strong> ${applicant.issueDate || ''}</div>
        </div>
      </div>

      <div class="office-section" style="margin-top: 20px; flex-direction: column;">
        <div><strong>ORIGINALLY ISSUED AT:</strong> Cape Town</div>
        <div><strong>ISSUED APPROVED:</strong></div>
        <div><strong>NUMBER OF EXTENSIONS:</strong> 1</div>
        <div><strong>PERMIT HOLDER SIGNATURE:</strong></div>
      </div>
    </div>

    <div class="verification-text">
      <strong>For verification of this document, please contact DHA<br>
      verification.ctrno@dha.gov.za</strong>
    </div>
  </div>
</body>
</html>
  `;
}

export async function generateAuthenticDocument(applicant, documentType, outputPath) {
  try {
    const html = await generateDocumentHTML(applicant, documentType);
    
    const chromiumPath = getChromiumPath();
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };
    
    if (chromiumPath) {
      launchOptions.executablePath = chromiumPath;
    }
    
    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfOptions = {
      format: documentType === 'Permanent Residence' || documentType === 'Birth Certificate' || documentType === 'Naturalization Certificate' || documentType === 'Refugee Status (Section 24)' ? 'A4' : 'A4',
      landscape: documentType === 'General Work Permit' || documentType === "Relative's Permit",
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    };
    
    if (outputPath) {
      pdfOptions.path = outputPath;
    }
    
    const pdfBuffer = await page.pdf(pdfOptions);

    await browser.close();
    
    console.log(`✅ Generated ${documentType} for ${applicant.name || applicant.surname}`);
    
    return outputPath ? outputPath : pdfBuffer;
    
  } catch (error) {
    console.error(`❌ Error generating ${documentType} for ${applicant.name}:`, error);
    throw error;
  }
}

export async function generateAllDocuments(applicants) {
  const documentsDir = path.join(PROJECT_ROOT, 'generated_documents');
  
  if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
  }

  const results = [];
  
  for (const applicant of applicants) {
    try {
      const sanitizedName = applicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const sanitizedType = applicant.type.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedName}_${sanitizedType}.pdf`;
      const outputPath = path.join(documentsDir, filename);
      
      await generateAuthenticDocument(applicant, applicant.type, outputPath);
      
      results.push({
        applicantId: applicant.id,
        name: applicant.name,
        type: applicant.type,
        path: outputPath,
        filename: filename,
        success: true
      });
    } catch (error) {
      results.push({
        applicantId: applicant.id,
        name: applicant.name,
        type: applicant.type,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}
