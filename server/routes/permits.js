import express from 'express';
import { getAllPermits, findPermitByNumber } from '../services/permit-service.js';
import { generatePermitPDF } from '../services/pdf-generator.js';
import QRCode from 'qrcode';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await getAllPermits();
    res.json({
      success: true,
      permits: result.permits,
      count: result.permits.length,
      usingRealApis: result.usingRealApis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await getAllPermits();
    const permit = result.permits.find(p => p.id === parseInt(req.params.id));
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Permit not found'
      });
    }
    
    res.json({
      success: true,
      permit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/pdf', async (req, res) => {
  try {
    const result = await getAllPermits();
    const permit = result.permits.find(p => p.id === parseInt(req.params.id));
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Permit not found'
      });
    }
    
    const pdfBuffer = await generatePermitPDF(permit);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="permit-${permit.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF: ' + error.message
    });
  }
});

router.get('/:id/qr', async (req, res) => {
  try {
    const result = await getAllPermits();
    const permit = result.permits.find(p => p.id === parseInt(req.params.id));
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Permit not found'
      });
    }
    
    const verificationUrl = `https://www.dha.gov.za/verify?ref=${permit.permitNumber || permit.referenceNumber || permit.fileNumber}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, { width: 300 });
    
    const qrImage = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    res.setHeader('Content-Type', 'image/png');
    res.send(qrImage);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id/verify', async (req, res) => {
  try {
    const result = await getAllPermits();
    const permit = result.permits.find(p => p.id === parseInt(req.params.id));
    
    if (!permit) {
      return res.status(404).json({
        success: false,
        error: 'Permit not found'
      });
    }
    
    const refNumber = permit.permitNumber || permit.referenceNumber || permit.fileNumber;
    
    res.json({
      success: true,
      verification: {
        dhaUrl: `https://www.dha.gov.za/verify?ref=${refNumber}`,
        eHomeAffairsUrl: `https://eservices.dha.gov.za/verification/verify?reference=${refNumber}`,
        qrUrl: `/api/permits/${permit.id}/qr`,
        reference: refNumber,
        type: permit.type,
        status: 'VALID',
        message: 'Document can be verified on official DHA website'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
