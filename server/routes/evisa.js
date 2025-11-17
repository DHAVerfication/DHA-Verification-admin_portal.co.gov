import express from 'express';
import { evisaGenerator } from '../services/evisa-generator.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { applicant } = req.body;

    if (!applicant) {
      return res.status(400).json({
        success: false,
        error: 'Applicant data is required'
      });
    }

    console.log(`📧 Generating E-visa for applicant: ${applicant.name}`);

    const result = await evisaGenerator.generateEvisa(applicant);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      evisaData: result.evisaData,
      html: result.html,
      qrCode: result.qrCode,
      authorization: result.authorization
    });
  } catch (error) {
    console.error('E-visa generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
