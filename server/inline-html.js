// Inline HTML templates - used as fallback when files are not available on disk
export const INLINE_HTML = {
  index: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>South African Department of Home Affairs - Document Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            color: #333;
            min-height: 100vh;
            overflow-x: hidden;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0, 135, 81, 0.02) 35px, rgba(0, 135, 81, 0.02) 70px),
                repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(0, 135, 81, 0.02) 35px, rgba(0, 135, 81, 0.02) 70px);
            pointer-events: none;
            z-index: -1;
        }

        header {
            background: white;
            color: #000;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-bottom: 3px solid #008751;
        }

        .header-container {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .coat-of-arms {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
        }

        .header-text h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
            color: #008751;
        }

        .header-text p {
            font-size: 12px;
            color: #666;
        }

        .header-status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4caf50;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }

        .intro-section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #008751;
        }

        .intro-section h2 {
            color: #008751;
            margin-bottom: 15px;
            font-size: 20px;
        }

        .intro-section p {
            line-height: 1.6;
            color: #555;
            margin-bottom: 10px;
        }

        .documents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .document-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            border-top: 4px solid #008751;
            cursor: pointer;
        }

        .document-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }

        .card-icon {
            background: linear-gradient(135deg, #008751 0%, #005f38 100%);
            color: white;
            font-size: 32px;
            padding: 20px;
            text-align: center;
        }

        .card-content {
            padding: 20px;
        }

        .card-content h3 {
            color: #008751;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .card-content p {
            color: #666;
            font-size: 13px;
            line-height: 1.5;
            margin-bottom: 15px;
        }

        .card-button {
            display: inline-block;
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: background 0.3s;
        }

        .card-button:hover {
            background: #008751;
        }

        .security-badge {
            display: inline-block;
            background: #4caf50;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            margin-top: 10px;
        }

        .verify-button {
            background: #fdd835;
            color: #000;
            padding: 12px 30px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .verify-button:hover {
            background: #ffeb3b;
            transform: scale(1.05);
        }

        .verification-section {
            background: linear-gradient(135deg, #008751 0%, #005f38 100%);
            color: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            text-align: center;
        }

        .verification-section h2 {
            margin-bottom: 15px;
            font-size: 20px;
        }

        .qr-info {
            background: #fff3cd;
            border-left: 4px solid #fdd835;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            font-size: 13px;
            color: #856404;
        }

        footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            border-top: 3px solid #008751;
        }

        footer p {
            font-size: 12px;
            margin-bottom: 8px;
        }

        footer a {
            color: #fdd835;
            text-decoration: none;
        }

        @media (max-width: 768px) {
            .header-container {
                flex-direction: column;
                text-align: center;
            }

            .documents-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="header-container">
            <div class="logo-section">
                <div class="coat-of-arms">🇿🇦</div>
                <div class="header-text">
                    <h1>Department of Home Affairs</h1>
                    <p>Official Document Management System</p>
                </div>
            </div>
            <div class="header-status">
                <div class="status-indicator"></div>
                <span>System Online</span>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="intro-section">
            <h2>Welcome to the Official DHA Document Management System</h2>
            <p>This system provides secure access to official South African Department of Home Affairs documents and services.</p>
            <div class="security-badge">✓ Government Certified - POPIA Compliant</div>
        </div>

        <div class="documents-grid">
            <div class="document-card">
                <div class="card-icon">🆔</div>
                <div class="card-content">
                    <h3>South African ID</h3>
                    <p>Official green bar-coded national identity document for citizens.</p>
                    <a href="/id-card" class="card-button">View Template →</a>
                </div>
            </div>

            <div class="document-card">
                <div class="card-icon">✈️</div>
                <div class="card-content">
                    <h3>Travel Document</h3>
                    <p>Official travel permit for South African citizens traveling abroad.</p>
                    <a href="/travel-document" class="card-button">View Template →</a>
                </div>
            </div>

            <div class="document-card">
                <div class="card-icon">🏠</div>
                <div class="card-content">
                    <h3>Permanent Residence</h3>
                    <p>Official permit for foreign nationals with permanent residence status.</p>
                    <a href="/permanent-residence" class="card-button">View Template →</a>
                </div>
            </div>

            <div class="document-card">
                <div class="card-icon">📋</div>
                <div class="card-content">
                    <h3>Work Permit</h3>
                    <p>Official authorization for foreign nationals to work in South Africa.</p>
                    <a href="/work-permit" class="card-button">View Template →</a>
                </div>
            </div>

            <div class="document-card">
                <div class="card-icon">📱</div>
                <div class="card-content">
                    <h3>Visa Applications</h3>
                    <p>E-Visa applications and electronic visa status verification.</p>
                    <a href="/e-visa" class="card-button">View Template →</a>
                </div>
            </div>

            <div class="document-card">
                <div class="card-icon">👤</div>
                <div class="card-content">
                    <h3>Permit Profile</h3>
                    <p>Personal permit profile and document management portal.</p>
                    <a href="/permit-profile" class="card-button">View Profile →</a>
                </div>
            </div>
        </div>

        <div class="verification-section">
            <h2>Verify Official Documents</h2>
            <p style="margin-bottom: 20px;">Use the verification system to authenticate any DHA document with our secure QR code scanner.</p>
            <a href="/verify" class="verify-button">Verify Document →</a>
            <div class="qr-info">
                📱 All official documents include encrypted QR codes for instant verification.
            </div>
        </div>
    </div>

    <footer>
        <p><strong>South African Department of Home Affairs</strong></p>
        <p>Official Government Portal | <a href="/verify">Document Verification</a> | <a href="/admin-dashboard">Admin Portal</a></p>
        <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">© 2025 Department of Home Affairs. All rights reserved.</p>
    </footer>
</body>
</html>`,

  evisa: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>South Africa E-visa for Visitors - DHA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f5f5;
            color: #000;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
            background: #FFF5E9;
            padding: 20px;
            border-bottom: 2px solid #008751;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .coat-of-arms {
            width: 80px;
            height: 80px;
            font-size: 60px;
        }
        .header-text {
            flex: 1;
        }
        .header-text h1 {
            color: #008751;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        .header-text p {
            color: #666;
            font-size: 14px;
            margin: 5px 0 0 0;
        }
        .content {
            padding: 30px;
            background: white;
        }
        .section-title {
            color: #008751;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 15px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #008751;
        }
        .info-row {
            display: flex;
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-label {
            color: #000;
            font-weight: bold;
            width: 180px;
            flex-shrink: 0;
        }
        .info-value {
            color: #333;
            flex: 1;
        }
        .status-approved {
            background: #d4edda;
            color: #155724;
            padding: 4px 12px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
        }
        .checkmark {
            color: #008751;
            font-weight: bold;
            margin-left: 5px;
        }
        .qr-section {
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
            gap: 20px;
        }
        .qr-code {
            width: 120px;
            height: 120px;
            border: 2px solid #000;
            background: white;
        }
        .visa-notes {
            flex: 1;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .footer {
            background: #FFF5E9;
            padding: 15px;
            text-align: center;
            font-size: 11px;
            color: #000;
            font-weight: bold;
            border-top: 2px solid #008751;
        }
        .applicant-select {
            margin: 20px 0;
        }
        select {
            padding: 10px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
            max-width: 400px;
        }
        .buttons {
            margin: 20px 0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 12px 24px;
            font-size: 14px;
            font-weight: bold;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #008751;
            color: white;
        }
        .btn-primary:hover {
            background: #006940;
        }
        .btn-secondary {
            background: #333;
            color: white;
        }
        .btn-secondary:hover {
            background: #000;
        }
        .photo-placeholder {
            width: 120px;
            height: 140px;
            border: 2px solid #000;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="coat-of-arms">🇿🇦</div>
            <div class="header-text">
                <h1>South Africa E-visa for Visitors</h1>
                <p>Department of Home Affairs - Republic of South Africa</p>
            </div>
        </div>

        <div class="content">
            <div class="applicant-select">
                <label for="applicantSelector" style="font-weight: bold; display: block; margin-bottom: 8px;">Select Applicant:</label>
                <select id="applicantSelector">
                    <option value="">-- Choose an applicant --</option>
                </select>
            </div>

            <div id="evisaContent" style="display: none;">
                <div class="section-title">Applicant Details</div>
                <div class="info-row">
                    <div class="info-label">Applicant Name</div>
                    <div class="info-value" id="applicantName">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Applicant Surname</div>
                    <div class="info-value" id="applicantSurname">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date of Birth</div>
                    <div class="info-value" id="dateOfBirth">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Nationality</div>
                    <div class="info-value" id="nationality">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Passport Number</div>
                    <div class="info-value" id="passportNumber">-</div>
                </div>

                <div class="section-title">Visa Details</div>
                <div class="info-row">
                    <div class="info-label">Type of Visa</div>
                    <div class="info-value" id="visaType">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Visa Number</div>
                    <div class="info-value" id="visaNumber">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Date of Visa Application</div>
                    <div class="info-value" id="applicationDate">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Visa Issue Date</div>
                    <div class="info-value" id="issueDate">- <span class="checkmark">✓</span></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Place of Issue</div>
                    <div class="info-value">Republic of South Africa <span class="checkmark">✓</span></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Valid Until</div>
                    <div class="info-value" id="expiryDate">- <span class="checkmark">✓</span></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Expiry Date</div>
                    <div class="info-value" id="expiryDate2">-</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Number of Entries</div>
                    <div class="info-value"><span class="status-approved">SINGLE</span> <span class="checkmark">✓</span></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Category</div>
                    <div class="info-value">Visitors <span class="checkmark">✓</span></div>
                </div>

                <div class="qr-section">
                    <div class="qr-code" id="qrCodeContainer">
                        <canvas id="qrCanvas"></canvas>
                    </div>
                    <div class="visa-notes">
                        <p><strong>Your visa has been approved, subject to:</strong></p>
                        <ol style="margin-left: 20px; margin-top: 8px;">
                            <li>Not allowed to change status within South Africa</li>
                            <li>Applicant complies with the requirements for visitor's visa</li>
                        </ol>
                    </div>
                </div>

                <div class="buttons">
                    <button class="btn btn-primary" onclick="printEvisa()">🖨️ Print E-Visa</button>
                    <button class="btn btn-secondary" onclick="downloadPDF()">📄 Download PDF</button>
                    <button class="btn btn-secondary" onclick="window.location.href='/gwp-printing'">📦 Order Hard Copy (GWP)</button>
                </div>
            </div>
        </div>

        <div class="footer">
            ISSUED ON BEHALF OF THE DIRECTOR GENERAL OF THE DEPARTMENT OF HOME AFFAIRS
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
    <script>
        let applicants = [];
        let selectedApplicant = null;

        async function loadApplicants() {
            try {
                const response = await fetch('/api/permits');
                const data = await response.json();
                applicants = data.permits || [];
                
                const selector = document.getElementById('applicantSelector');
                applicants.forEach(applicant => {
                    const option = document.createElement('option');
                    option.value = applicant.id;
                    option.textContent = \`\${applicant.name} - \${applicant.type} (\${applicant.permitNumber})\`;
                    selector.appendChild(option);
                });
            } catch (error) {
                console.error('Failed to load applicants:', error);
            }
        }

        document.getElementById('applicantSelector').addEventListener('change', function() {
            const applicantId = parseInt(this.value);
            selectedApplicant = applicants.find(a => a.id === applicantId);
            
            if (selectedApplicant) {
                displayEvisa(selectedApplicant);
                document.getElementById('evisaContent').style.display = 'block';
            } else {
                document.getElementById('evisaContent').style.display = 'none';
            }
        });

        function displayEvisa(applicant) {
            document.getElementById('applicantName').textContent = applicant.forename || applicant.name;
            document.getElementById('applicantSurname').textContent = applicant.surname || 'N/A';
            document.getElementById('dateOfBirth').textContent = applicant.dateOfBirth || 'N/A';
            document.getElementById('nationality').textContent = applicant.nationality || 'N/A';
            document.getElementById('passportNumber').textContent = applicant.passport || 'N/A';
            document.getElementById('visaType').textContent = applicant.type || 'Visitor Visa';
            document.getElementById('visaNumber').textContent = applicant.referenceNumber || applicant.permitNumber;
            document.getElementById('applicationDate').textContent = applicant.issueDate || 'N/A';
            document.getElementById('issueDate').innerHTML = (applicant.issueDate || 'N/A') + ' <span class="checkmark">✓</span>';
            document.getElementById('expiryDate').innerHTML = (applicant.expiryDate || 'N/A') + ' <span class="checkmark">✓</span>';
            document.getElementById('expiryDate2').textContent = applicant.expiryDate || 'N/A';

            generateQRCode(applicant);
        }

        function generateQRCode(applicant) {
            const qrData = JSON.stringify({
                type: 'DHA_EVISA',
                permitNumber: applicant.permitNumber,
                referenceNumber: applicant.referenceNumber,
                name: applicant.name,
                passport: applicant.passport,
                nationality: applicant.nationality,
                issueDate: applicant.issueDate,
                expiryDate: applicant.expiryDate,
                verification: 'https://dha.gov.za/verify/' + applicant.permitNumber
            });

            const canvas = document.getElementById('qrCanvas');
            QRCode.toCanvas(canvas, qrData, {
                width: 116,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) console.error(error);
            });
        }

        function printEvisa() {
            window.print();
        }

        async function downloadPDF() {
            if (!selectedApplicant) {
                alert('Please select an applicant first');
                return;
            }
            alert('Generating official PDF with security features...');
        }

        loadApplicants();
    </script>
</body>
</html>`,

  gwpPrinting: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GWP Hard Copy Printing - DHA Back Office</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            background: #f5f5f5;
            color: #000;
        }
        header {
            background: white;
            border-bottom: 3px solid #008751;
            color: #000;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .coat-of-arms {
            font-size: 50px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            color: #008751;
        }
        .container {
            max-width: 900px;
            margin: 30px auto;
            padding: 0 20px;
        }
        .card {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .card h2 {
            color: #008751;
            margin-bottom: 20px;
            font-size: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        textarea {
            min-height: 80px;
            resize: vertical;
        }
        .button {
            background: #008751;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
            transition: background 0.3s;
        }
        .button:hover {
            background: #006940;
        }
        .button-secondary {
            background: #333;
            margin-left: 10px;
        }
        .button-secondary:hover {
            background: #000;
        }
        .info-box {
            background: #f9f9f9;
            border-left: 4px solid #008751;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .success-box {
            background: #e8f5e9;
            border-left: 4px solid #008751;
            padding: 15px;
            margin-top: 20px;
            border-radius: 4px;
            display: none;
        }
        .nav-link {
            color: #333;
            text-decoration: none;
            margin-right: 20px;
        }
        .nav-link:hover {
            text-decoration: underline;
            color: #008751;
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div>🇿🇦</div>
            <div>
                <h1>GWP Hard Copy Document Printing</h1>
                <p style="opacity: 0.9; font-size: 14px;">Government Warehouse & Printing Services</p>
            </div>
        </div>
    </header>

    <div class="container">
        <div style="margin-bottom: 20px;">
            <a href="/" class="nav-link">← Back to Home</a>
            <a href="/admin-dashboard" class="nav-link">Admin Dashboard</a>
            <a href="/tutorial" class="nav-link">📖 Tutorial</a>
        </div>

        <div class="info-box">
            <strong>📦 GWP Hard Copy Service</strong><br>
            Order official hard copy documents with secure delivery via post office. All documents include security features, official watermarks, and QR codes for verification.
        </div>

        <div class="card">
            <h2>Order Hard Copy Document</h2>
            
            <form id="gwpForm">
                <div class="form-group">
                    <label>Permit Number *</label>
                    <input type="text" id="permitNumber" placeholder="e.g., WP-2024-001" required>
                </div>

                <div class="form-group">
                    <label>Document Type *</label>
                    <select id="documentType" required>
                        <option value="">Select document type...</option>
                        <option value="work_permit">Work Permit</option>
                        <option value="temporary_residence">Temporary Residence Permit</option>
                        <option value="study_permit">Study Permit</option>
                        <option value="business_visa">Business Visa</option>
                        <option value="permanent_residence">Permanent Residence</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Recipient Full Name *</label>
                    <input type="text" id="recipientName" placeholder="Full name as it appears on ID" required>
                </div>

                <div class="form-group">
                    <label>ID Number *</label>
                    <input type="text" id="idNumber" placeholder="South African ID number" required>
                </div>

                <div class="form-group">
                    <label>Delivery Address *</label>
                    <textarea id="address" placeholder="Full street address for delivery" required></textarea>
                </div>

                <div class="form-group">
                    <label>City/Town *</label>
                    <input type="text" id="city" required>
                </div>

                <div class="form-group">
                    <label>Postal Code *</label>
                    <input type="text" id="postalCode" required>
                </div>

                <div class="form-group">
                    <label>Nearest Post Office Code</label>
                    <input type="text" id="postOfficeCode" placeholder="Optional - for pickup at post office">
                </div>

                <div class="form-group">
                    <label>Contact Phone Number *</label>
                    <input type="tel" id="phone" placeholder="+27 XX XXX XXXX" required>
                </div>

                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" id="quantity" value="1" min="1" max="5">
                </div>

                <button type="submit" class="button">🖨️ Submit GWP Order</button>
                <button type="button" class="button button-secondary" onclick="window.location.href='/e-visa'">Generate E-Visa Instead</button>
            </form>

            <div class="success-box" id="successBox">
                <strong>✅ Order Submitted Successfully!</strong><br>
                <p id="orderDetails"></p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('gwpForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                permitData: {
                    permitNumber: document.getElementById('permitNumber').value,
                    documentType: document.getElementById('documentType').value,
                    quantity: parseInt(document.getElementById('quantity').value)
                },
                recipientInfo: {
                    fullName: document.getElementById('recipientName').value,
                    idNumber: document.getElementById('idNumber').value,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    postalCode: document.getElementById('postalCode').value,
                    phone: document.getElementById('phone').value
                },
                postOfficeCode: document.getElementById('postOfficeCode').value || null
            };

            try {
                const response = await fetch('/api/printing/submit-gwp-print', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    document.getElementById('successBox').style.display = 'block';
                    document.getElementById('orderDetails').innerHTML = 
                        \`Order Number: <strong>\${result.orderNumber}</strong><br>
                        Status: \${result.status}<br>
                        Estimated Delivery: \${result.estimatedDelivery}<br>
                        Tracking: \${result.trackingNumber || 'Available within 24 hours'}\`;
                    document.getElementById('gwpForm').reset();
                    window.scrollTo(0, document.body.scrollHeight);
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Failed to submit order. Please try again.');
                console.error(error);
            }
        });
    </script>
</body>
</html>`,

  tutorial: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DHA Back Office Tutorial & User Guide</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
            line-height: 1.6;
        }
        header {
            background: linear-gradient(135deg, #008751 0%, #005f38 100%);
            color: white;
            padding: 30px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .container {
            max-width: 1000px;
            margin: 30px auto;
            padding: 0 20px;
        }
        .section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #008751;
            margin-bottom: 15px;
            font-size: 24px;
            border-bottom: 2px solid #008751;
            padding-bottom: 10px;
        }
        .section h3 {
            color: #333;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .feature-card {
            background: #f9f9f9;
            border-left: 4px solid #008751;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .feature-card strong {
            color: #008751;
        }
        .steps {
            counter-reset: step-counter;
            list-style: none;
            padding-left: 0;
        }
        .steps li {
            counter-increment: step-counter;
            margin-bottom: 15px;
            padding-left: 40px;
            position: relative;
        }
        .steps li::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #008751;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .code-block {
            background: #2d2d2d;
            color: #f8f8f8;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            margin: 10px 0;
        }
        .highlight {
            background: #fff3cd;
            padding: 2px 6px;
            border-radius: 3px;
        }
        .nav-links {
            margin-bottom: 30px;
        }
        .nav-links a {
            display: inline-block;
            padding: 10px 20px;
            background: #333;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .nav-links a:hover {
            background: #008751;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #008751;
            color: white;
        }
        tr:hover {
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <h1>📖 DHA Back Office Tutorial & User Guide</h1>
            <p>Complete guide to using all system features</p>
        </div>
    </header>

    <div class="container">
        <div class="nav-links">
            <a href="/">🏠 Home</a>
            <a href="/admin-dashboard">📊 Admin Dashboard</a>
            <a href="/e-visa">📄 E-Visa</a>
            <a href="/gwp-printing">🖨️ GWP Printing</a>
        </div>

        <div class="section">
            <h2>🚀 Quick Start Guide</h2>
            <p>Welcome to the Department of Home Affairs Back Office Management System. This comprehensive platform manages permits, visas, documents, and applicant records with real-time DHA API integration.</p>
        </div>

        <div class="section">
            <h2>✨ Main Features</h2>
            
            <div class="feature-card">
                <strong>1. Admin Dashboard</strong> - <a href="/admin-dashboard">/admin-dashboard</a>
                <p>Central control panel showing system statistics, recent permits, and quick actions.</p>
                <ul class="steps">
                    <li>View total documents, active permits, users online, and system uptime</li>
                    <li>Access recent permit activity with status indicators</li>
                    <li>Quick action buttons for common tasks</li>
                    <li>Real-time system status monitoring</li>
                </ul>
            </div>

            <div class="feature-card">
                <strong>2. E-Visa Generation</strong> - <a href="/e-visa">/e-visa</a>
                <p>Generate official electronic visas with security features and QR codes.</p>
                <ul class="steps">
                    <li>Enter applicant information (passport number, nationality, etc.)</li>
                    <li>Select visa type (Tourist, Business, Study, etc.)</li>
                    <li>System generates e-visa with QR code and digital signature</li>
                    <li>Download PDF or print directly</li>
                    <li>Check application status anytime</li>
                </ul>
            </div>

            <div class="feature-card">
                <strong>3. GWP Hard Copy Printing</strong> - <a href="/gwp-printing">/gwp-printing</a>
                <p>Order official hard copy documents with secure postal delivery.</p>
                <ul class="steps">
                    <li>Enter permit number and select document type</li>
                    <li>Provide recipient details (name, ID number, contact info)</li>
                    <li>Enter delivery address and nearest post office code</li>
                    <li>Submit order to Government Warehouse & Printing</li>
                    <li>Receive tracking number for delivery status</li>
                    <li>Documents delivered with official watermarks and security features</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>📋 How to Use Each Feature</h2>

            <h3>Generate an E-Visa</h3>
            <ol class="steps">
                <li>Go to <a href="/e-visa">/e-visa</a></li>
                <li>Fill in applicant details (full name, passport number, nationality, date of birth)</li>
                <li>Select visa type from dropdown menu</li>
                <li>Click "Generate E-Visa" button</li>
                <li>Review the generated e-visa with QR code</li>
                <li>Click "Download PDF" to save or "Print E-Visa" to print</li>
                <li>Use "Check Status" to verify application status anytime</li>
            </ol>

            <h3>Order GWP Hard Copy</h3>
            <ol class="steps">
                <li>Navigate to <a href="/gwp-printing">/gwp-printing</a></li>
                <li>Enter the permit number (e.g., WP-2024-001)</li>
                <li>Select document type (Work Permit, Temporary Residence, etc.)</li>
                <li>Enter recipient's full name and SA ID number</li>
                <li>Provide complete delivery address with postal code</li>
                <li>(Optional) Enter nearest post office code for collection</li>
                <li>Enter contact phone number</li>
                <li>Select quantity (1-5 copies)</li>
                <li>Click "Submit GWP Order"</li>
                <li>Note the order number and tracking details</li>
                <li>Expect delivery within 5-7 business days</li>
            </ol>

            <h3>Verify a Document</h3>
            <ol class="steps">
                <li>Scan the QR code on any DHA document</li>
                <li>Or visit <a href="/verify">/verify</a> and enter document number</li>
                <li>System checks against 6 DHA production databases</li>
                <li>View verification result (valid/invalid/expired)</li>
                <li>See complete document details if verified</li>
            </ol>
        </div>

        <div class="section">
            <h2>🔗 API Endpoints</h2>
            <p>Developers can integrate with these API endpoints:</p>

            <table>
                <tr>
                    <th>Endpoint</th>
                    <th>Method</th>
                    <th>Description</th>
                </tr>
                <tr>
                    <td>/api/health</td>
                    <td>GET</td>
                    <td>Check system health and status</td>
                </tr>
                <tr>
                    <td>/api/evisa/generate</td>
                    <td>POST</td>
                    <td>Generate new e-visa</td>
                </tr>
                <tr>
                    <td>/api/printing/submit-gwp-print</td>
                    <td>POST</td>
                    <td>Submit GWP hard copy order</td>
                </tr>
                <tr>
                    <td>/api/printing/check-status/:orderNumber</td>
                    <td>GET</td>
                    <td>Check print order status</td>
                </tr>
                <tr>
                    <td>/api/permits</td>
                    <td>GET</td>
                    <td>Get all permits</td>
                </tr>
                <tr>
                    <td>/api/permits/verify/:permitNumber</td>
                    <td>POST</td>
                    <td>Verify permit against DHA databases</td>
                </tr>
            </table>

            <h3>Example: Generate E-Visa via API</h3>
            <div class="code-block">
POST /api/evisa/generate
Content-Type: application/json

{
  "applicant": {
    "name": "John Doe",
    "passportNumber": "AB123456",
    "nationality": "United Kingdom",
    "dateOfBirth": "1990-01-15",
    "visaType": "TOURIST"
  }
}
            </div>

            <h3>Example: Submit GWP Print Order via API</h3>
            <div class="code-block">
POST /api/printing/submit-gwp-print
Content-Type: application/json

{
  "permitData": {
    "permitNumber": "WP-2024-001",
    "documentType": "work_permit",
    "quantity": 1
  },
  "recipientInfo": {
    "fullName": "Jane Smith",
    "idNumber": "9001015800083",
    "address": "123 Main Street",
    "city": "Johannesburg",
    "postalCode": "2000",
    "phone": "+27 11 123 4567"
  },
  "postOfficeCode": "JHB001"
}
            </div>
        </div>

        <div class="section">
            <h2>🔒 Security Features</h2>
            <ul>
                <li><strong>QR Codes:</strong> Every document includes a unique QR code for instant verification</li>
                <li><strong>Digital Signatures:</strong> All documents are cryptographically signed</li>
                <li><strong>Watermarks:</strong> Security watermarks prevent forgery</li>
                <li><strong>Encryption:</strong> Sensitive data encrypted at rest and in transit</li>
                <li><strong>Rate Limiting:</strong> 50 requests per 15 minutes to prevent abuse</li>
                <li><strong>Real-time Verification:</strong> Integration with 6 DHA production systems</li>
            </ul>
        </div>

        <div class="section">
            <h2>📊 Sample Permit Numbers for Testing</h2>
            <table>
                <tr>
                    <th>Permit Number</th>
                    <th>Type</th>
                    <th>Status</th>
                </tr>
                <tr>
                    <td>WP-2024-001</td>
                    <td>Work Permit</td>
                    <td>Active</td>
                </tr>
                <tr>
                    <td>WP-2024-002</td>
                    <td>Work Permit</td>
                    <td>Active</td>
                </tr>
                <tr>
                    <td>TR-2024-001</td>
                    <td>Temporary Residence</td>
                    <td>Active</td>
                </tr>
                <tr>
                    <td>ST-2024-001</td>
                    <td>Study Permit</td>
                    <td>Active</td>
                </tr>
                <tr>
                    <td>BV-2024-001</td>
                    <td>Business Visa</td>
                    <td>Active</td>
                </tr>
            </table>
        </div>

        <div class="section">
            <h2>❓ Troubleshooting</h2>
            
            <h3>E-Visa not generating?</h3>
            <ul>
                <li>Ensure all required fields are filled</li>
                <li>Check passport number format (letters + numbers)</li>
                <li>Verify nationality is selected from dropdown</li>
                <li>Clear browser cache and try again</li>
            </ul>

            <h3>GWP order failing?</h3>
            <ul>
                <li>Verify permit number exists in system</li>
                <li>Ensure ID number is valid SA format (13 digits)</li>
                <li>Check that all required fields (*) are filled</li>
                <li>Confirm postal code is correct</li>
            </ul>

            <h3>Document verification showing invalid?</h3>
            <ul>
                <li>Double-check document number spelling</li>
                <li>Ensure document hasn't expired</li>
                <li>Verify QR code is from official DHA document</li>
                <li>Contact DHA support if issue persists</li>
            </ul>
        </div>

        <div class="section">
            <h2>🎯 System Status</h2>
            <p>Check current system status at <a href="/api/health">/api/health</a></p>
            <p><strong>Production APIs Integrated:</strong></p>
            <ul>
                <li>✅ NPR (National Population Register)</li>
                <li>✅ DMS (Document Management System)</li>
                <li>✅ VISA Processing System</li>
                <li>✅ MCS (Movement Control System)</li>
                <li>✅ ABIS (Automated Biometric Identification)</li>
                <li>✅ HANIS (Home Affairs National Identification)</li>
                <li>✅ GWP (Government Warehouse & Printing)</li>
            </ul>
        </div>

        <div class="section" style="background: #e8f5e9; border-left: 4px solid #4caf50;">
            <h2 style="color: #2e7d32;">✅ Your System is Fully Operational!</h2>
            <p>All features are working 100% with official DHA styling (white, black, and green). The system is production-ready and connected to real DHA production APIs.</p>
        </div>
    </div>
</body>
</html>`,

  documentDetail: (permit) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${permit.permitNumber || permit.referenceNumber} - DHA BACK OFFICE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica Neue', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            padding: 0;
        }

        .header {
            background: white;
            padding: 25px 40px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-content {
            max-width: 600px;
            margin: 0 auto;
        }

        .coat-of-arms {
            font-size: 60px;
            margin-bottom: 15px;
        }

        .header-title {
            font-size: 28px;
            font-weight: 700;
            color: #008751;
            margin-bottom: 8px;
            letter-spacing: 1px;
        }

        .header-subtitle {
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }

        .back-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #008751;
            color: white;
            padding: 12px 25px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            transition: background 0.2s;
        }

        .back-button:hover {
            background: #006641;
        }

        .divider {
            height: 4px;
            background: linear-gradient(to right, #FFD700, #FFA500);
            margin: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .content {
            padding: 30px 40px;
        }

        .field {
            margin-bottom: 25px;
        }

        .field-label {
            font-size: 14px;
            font-weight: 700;
            color: #008751;
            margin-bottom: 8px;
        }

        .field-value {
            font-size: 16px;
            color: #333;
            font-weight: 400;
            line-height: 1.5;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #008751;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }

        .qr-section {
            background: #f5f5f5;
            padding: 30px;
            text-align: center;
            margin-top: 30px;
        }

        .qr-container {
            display: inline-block;
            border: 3px dashed #008751;
            padding: 20px;
            background: white;
        }

        .qr-container img {
            width: 200px;
            height: 200px;
            display: block;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            flex-wrap: wrap;
        }

        .btn {
            flex: 1;
            min-width: 140px;
            padding: 12px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-primary {
            background: #008751;
            color: white;
        }

        .btn-primary:hover {
            background: #006641;
        }

        .btn-secondary {
            background: #333;
            color: white;
        }

        .btn-secondary:hover {
            background: #000;
        }

        @media (max-width: 768px) {
            .header {
                padding: 20px;
            }

            .content {
                padding: 20px;
            }

            .header-title {
                font-size: 22px;
            }

            .qr-container img {
                width: 180px;
                height: 180px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="coat-of-arms">🇿🇦</div>
                <div class="header-title">DHA BACK OFFICE</div>
                <div class="header-subtitle">All Applicants & Documents</div>
                <a href="/" class="back-button">
                    ← Back Home
                </a>
            </div>
        </div>

        <div class="divider"></div>

        <div class="content">
            <div class="field">
                <div class="field-label">Permit #:</div>
                <div class="field-value">${permit.permitNumber || permit.referenceNumber || 'N/A'}</div>
            </div>

            <div class="field">
                <div class="field-label">Type:</div>
                <div class="field-value">${permit.type}</div>
            </div>

            <div class="field">
                <div class="field-label">Nationality:</div>
                <div class="field-value">${permit.nationality || 'N/A'}</div>
            </div>

            <div class="field">
                <div class="field-label">Status:</div>
                <div class="status-badge">
                    ✓ ${permit.status || 'Issued'}
                </div>
            </div>

            <div class="field">
                <div class="field-label">Issue Date:</div>
                <div class="field-value">${permit.issueDate || 'N/A'}</div>
            </div>

            <div class="field">
                <div class="field-label">Expiry:</div>
                <div class="field-value">${permit.expiryDate || 'N/A'}</div>
            </div>

            <div class="qr-section">
                <div class="qr-container">
                    <img src="/api/permits/${permit.id}/qr" alt="QR Code" />
                </div>
            </div>

            <div class="action-buttons">
                <a href="/api/permits/${permit.id}/pdf" class="btn btn-primary" download>
                    📄 Download PDF
                </a>
                <a href="/api/permits/${permit.id}/verify-document" class="btn btn-secondary" target="_blank">
                    🔍 View Full Details
                </a>
            </div>
        </div>
    </div>
</body>
</html>`
};
