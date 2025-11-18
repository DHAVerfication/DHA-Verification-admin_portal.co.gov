import express from 'express';
import { getAllPermits } from '../services/permit-service.js';
import { generateAuthenticDocument } from '../services/authentic-document-generator.js';
import QRCode from 'qrcode';
import JSZip from 'jszip';

const router = express.Router();

// GET all applicants/permits for display
router.get('/', async (req, res) => {
  try {
    const result = await getAllPermits();
    const permits = result.permits.map(p => ({
      id: p.id,
      name: p.applicantFullName || p.name || `${p.surname} ${p.forename}`,
      type: p.type,
      permitNumber: p.permitNumber || p.referenceNumber,
      status: p.status || 'ACTIVE',
      issueDate: p.issueDate,
      expiryDate: p.expiryDate,
      nationality: p.nationality || 'South African',
      idNumber: p.idNumber || p.identityNumber,
      passport: p.passport,
      photoUrl: p.photoUrl || '/api/placeholder-photo.jpg',
      qrCode: p.qrCode
    }));

    res.json({
      success: true,
      count: permits.length,
      permits: permits
    });
  } catch (error) {
    console.error('[APPLICANTS API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET single applicant details
router.get('/:id', async (req, res) => {
  try {
    const result = await getAllPermits();
    const id = parseInt(req.params.id) || req.params.id;
    const permit = result.permits.find(p => p.id === id || String(p.id) === req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }

    res.json({
      success: true,
      applicant: {
        id: permit.id,
        name: permit.applicantFullName || permit.name || `${permit.surname} ${permit.forename}`,
        type: permit.type,
        permitNumber: permit.permitNumber || permit.referenceNumber,
        status: permit.status || 'ACTIVE',
        issueDate: permit.issueDate,
        expiryDate: permit.expiryDate,
        nationality: permit.nationality || 'South African',
        idNumber: permit.idNumber || permit.identityNumber,
        passport: permit.passport,
        email: permit.email,
        phone: permit.phone,
        address: permit.address,
        photoUrl: permit.photoUrl || '/api/placeholder-photo.jpg'
      }
    });
  } catch (error) {
    console.error('[APPLICANT DETAILS] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET applicant as PDF document
router.get('/:id/pdf', async (req, res) => {
  try {
    const result = await getAllPermits();
    const id = parseInt(req.params.id) || req.params.id;
    const permit = result.permits.find(p => p.id === id || String(p.id) === req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }

    const pdfBuffer = await generateAuthenticDocument(permit, permit.type);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${permit.id}_${permit.type || 'document'}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[PDF GENERATION] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET QR code for applicant
router.get('/:id/qr', async (req, res) => {
  try {
    const result = await getAllPermits();
    const id = parseInt(req.params.id) || req.params.id;
    const permit = result.permits.find(p => p.id === id || String(p.id) === req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }

    const verificationUrl = `https://${req.get('host')}/verify?ref=${permit.permitNumber || permit.referenceNumber}&id=${permit.id}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 10
    });

    res.json({
      success: true,
      qrCode: qrDataUrl,
      verificationUrl: verificationUrl
    });
  } catch (error) {
    console.error('[QR GENERATION] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST download all documents as ZIP
router.post('/download-all', async (req, res) => {
  try {
    const result = await getAllPermits();
    const zip = new JSZip();

    for (const permit of result.permits) {
      try {
        const pdfBuffer = await generateAuthenticDocument(permit, permit.type);
        const fileName = `${permit.id}_${permit.type || 'document'}.pdf`;
        zip.file(fileName, pdfBuffer);
      } catch (error) {
        console.warn(`Failed to generate PDF for permit ${permit.id}:`, error.message);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="DHA_Applicants_Documents.zip"');
    res.send(zipBuffer);
  } catch (error) {
    console.error('[BULK DOWNLOAD] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
