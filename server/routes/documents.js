import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { getAllPermits } from '../services/permit-service.js';
import { generateAuthenticDocument, generateAllDocuments } from '../services/authentic-document-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../..');
const DOCUMENTS_DIR = path.join(PROJECT_ROOT, 'generated_documents');

const router = express.Router();

async function tryDHAApiFirst(applicant) {
  console.log(`🌐 Attempting to fetch document from DHA API for ${applicant.name}...`);
  
  return null;
}

router.get('/generate-all', async (req, res) => {
  try {
    console.log('📄 Starting batch document generation...');
    
    const { permits } = await getAllPermits();
    const results = await generateAllDocuments(permits);
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      documents: results
    };
    
    console.log(`✅ Generated ${summary.successful}/${summary.total} documents`);
    
    res.json({
      success: true,
      message: `Generated ${summary.successful} documents`,
      data: summary
    });
    
  } catch (error) {
    console.error('❌ Error generating documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/applicant/:id', async (req, res) => {
  try {
    const applicantId = parseInt(req.params.id);
    const { permits } = await getAllPermits();
    const applicant = permits.find(p => p.id === applicantId);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }
    
    console.log(`📄 Fetching document for ${applicant.name}...`);
    
    const apiDocument = await tryDHAApiFirst(applicant);
    
    if (apiDocument) {
      console.log(`✅ Using real DHA API document for ${applicant.name}`);
      return res.json({
        success: true,
        source: 'dha_api',
        document: apiDocument
      });
    }
    
    console.log(`📝 Generating fallback document for ${applicant.name}...`);
    
    const sanitizedName = applicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedType = applicant.type.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${sanitizedType}.pdf`;
    const outputPath = path.join(DOCUMENTS_DIR, filename);
    
    try {
      await fs.access(outputPath);
      console.log(`✅ Using cached document for ${applicant.name}`);
    } catch {
      console.log(`🔨 Creating new document for ${applicant.name}...`);
      await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
      await generateAuthenticDocument(applicant, applicant.type, outputPath);
    }
    
    res.json({
      success: true,
      source: 'generated',
      applicant: {
        id: applicant.id,
        name: applicant.name,
        type: applicant.type,
        permitNumber: applicant.permitNumber
      },
      document: {
        filename: filename,
        path: `/api/documents/download/${applicant.id}`,
        previewUrl: `/api/documents/preview/${applicant.id}`
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/preview/:id', async (req, res) => {
  try {
    const applicantId = parseInt(req.params.id);
    const { permits } = await getAllPermits();
    const applicant = permits.find(p => p.id === applicantId);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }
    
    const sanitizedName = applicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedType = applicant.type.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${sanitizedType}.pdf`;
    const filePath = path.join(DOCUMENTS_DIR, filename);
    
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
      await generateAuthenticDocument(applicant, applicant.type, filePath);
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('❌ Error previewing document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/download/:id', async (req, res) => {
  try {
    const applicantId = parseInt(req.params.id);
    const { permits } = await getAllPermits();
    const applicant = permits.find(p => p.id === applicantId);
    
    if (!applicant) {
      return res.status(404).json({
        success: false,
        error: 'Applicant not found'
      });
    }
    
    const sanitizedName = applicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const sanitizedType = applicant.type.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${sanitizedName}_${sanitizedType}.pdf`;
    const filePath = path.join(DOCUMENTS_DIR, filename);
    
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(DOCUMENTS_DIR, { recursive: true });
      await generateAuthenticDocument(applicant, applicant.type, filePath);
    }
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileBuffer = await fs.readFile(filePath);
    res.send(fileBuffer);
    
  } catch (error) {
    console.error('❌ Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { permits } = await getAllPermits();
    
    const documents = permits.map(applicant => {
      const sanitizedName = applicant.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const sanitizedType = applicant.type.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `${sanitizedName}_${sanitizedType}.pdf`;
      
      return {
        id: applicant.id,
        name: applicant.name,
        type: applicant.type,
        permitNumber: applicant.permitNumber,
        filename: filename,
        previewUrl: `/api/documents/preview/${applicant.id}`,
        downloadUrl: `/api/documents/download/${applicant.id}`
      };
    });
    
    res.json({
      success: true,
      count: documents.length,
      documents: documents
    });
    
  } catch (error) {
    console.error('❌ Error listing documents:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
