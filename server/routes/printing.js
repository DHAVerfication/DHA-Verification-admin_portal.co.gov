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

router.get('/gwp-booking/:applicantId', async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { getBookingByApplicantId } = await import('../services/gwp-bookings.js');
    const booking = getBookingByApplicantId(applicantId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'No GWP booking found for this applicant'
      });
    }
    
    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('GWP booking check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/gwp-bookings/all', async (req, res) => {
  try {
    const { getAllBookings } = await import('../services/gwp-bookings.js');
    const bookings = getAllBookings();
    
    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error('GWP bookings fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
