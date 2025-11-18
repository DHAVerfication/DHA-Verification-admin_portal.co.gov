import express from 'express';
import { evisaGenerator } from '../services/evisa-generator.js';
import { getAllPermits, findPermitByNumber } from '../services/permit-service.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    let { applicant, permitNumber, id } = req.body;

    // If permitNumber provided, fetch applicant data
    if (permitNumber && !applicant) {
      const permit = await findPermitByNumber(permitNumber);
      if (!permit) {
        return res.status(404).json({
          success: false,
          error: `Permit not found: ${permitNumber}`
        });
      }
      applicant = permit;
    }

    // If ID provided, fetch applicant data
    if (id && !applicant) {
      const result = await getAllPermits();
      const permit = result.permits.find(p => p.id === parseInt(id));
      if (!permit) {
        return res.status(404).json({
          success: false,
          error: `Applicant not found with ID: ${id}`
        });
      }
      applicant = permit;
    }

    if (!applicant) {
      return res.status(400).json({
        success: false,
        error: 'Applicant data, permit number, or ID is required'
      });
    }

    console.log(`📧 Generating E-visa for: ${applicant.name || applicant.permitNumber}`);

    const result = await evisaGenerator.generateEvisa(applicant);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json({
      success: true,
      evisaData: result.evisaData,
      html: result.html,
      qrCode: result.qrCode,
      authData: result.authorization
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
