import express from 'express';
import { printingService } from '../services/printing-service.js';

const router = express.Router();

router.post('/submit-dha-print', async (req, res) => {
  try {
    const { permitData, recipientInfo } = req.body;
    
    if (!permitData || !recipientInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: permitData and recipientInfo'
      });
    }

    const result = await printingService.submitDHAOfficialPrint(permitData, recipientInfo);
    
    res.json(result);
  } catch (error) {
    console.error('DHA print submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/submit-gwp-print', async (req, res) => {
  try {
    const { permitData, recipientInfo, postOfficeCode } = req.body;
    
    if (!permitData || !recipientInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: permitData and recipientInfo'
      });
    }

    const result = await printingService.submitGWPHardCopy(
      permitData,
      recipientInfo,
      postOfficeCode
    );
    
    res.json(result);
  } catch (error) {
    console.error('GWP print submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/check-status/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const result = await printingService.checkPrintOrderStatus(orderNumber);
    res.json(result);
  } catch (error) {
    console.error('Print status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
