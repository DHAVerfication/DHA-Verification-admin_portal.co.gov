import express from 'express';
import trackingService from '../services/tracking-service.js';
import relaySystem from '../services/relay-system.js';
import webSocketService from '../services/websocket-service.js';

const router = express.Router();

// GET /api/tracking/:trackingNumber - Get current tracking status
router.get('/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    console.log(`📍 Fetching tracking info for: ${trackingNumber}`);
    
    const tracking = trackingService.getTracking(trackingNumber);
    
    if (!tracking) {
      return res.status(404).json({
        success: false,
        error: 'Tracking number not found'
      });
    }

    res.json({
      success: true,
      tracking
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tracking/:trackingNumber/history - Get full tracking history
router.get('/:trackingNumber/history', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    console.log(`📜 Fetching tracking history for: ${trackingNumber}`);
    
    const history = trackingService.getTrackingHistory(trackingNumber);
    
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'Tracking number not found'
      });
    }

    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching tracking history:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/:trackingNumber/subscribe - Subscribe to tracking updates
router.post('/:trackingNumber/subscribe', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { webhookUrl, notificationChannels } = req.body;
    
    console.log(`🔔 Subscription request for: ${trackingNumber}`);
    
    const tracking = trackingService.getTracking(trackingNumber);
    
    if (!tracking) {
      return res.status(404).json({
        success: false,
        error: 'Tracking number not found'
      });
    }

    // Create subscription
    const subscription = trackingService.subscribeToTracking(
      trackingNumber,
      (event) => {
        // Handle webhook notification if URL provided
        if (webhookUrl) {
          // In production, this would send webhook
          console.log(`Webhook notification to ${webhookUrl}:`, event);
        }
      }
    );

    res.json({
      success: true,
      message: 'Successfully subscribed to tracking updates',
      trackingNumber,
      subscriptionId: subscription.subscriberId,
      currentStatus: tracking.currentStage,
      websocketEndpoint: '/ws'
    });
  } catch (error) {
    console.error('Error subscribing to tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/:trackingNumber/unsubscribe - Unsubscribe from updates
router.post('/:trackingNumber/unsubscribe', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { subscriptionId } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Subscription ID required'
      });
    }

    trackingService.unsubscribe(trackingNumber, subscriptionId);

    res.json({
      success: true,
      message: 'Successfully unsubscribed from tracking updates'
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/:trackingNumber/update - Update tracking status (internal use)
router.post('/:trackingNumber/update', async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { stage, location, notes, operator } = req.body;
    
    if (!stage) {
      return res.status(400).json({
        success: false,
        error: 'Stage is required'
      });
    }

    console.log(`🔄 Updating tracking ${trackingNumber} to stage: ${stage}`);
    
    const updatedTracking = trackingService.updateStatus(trackingNumber, stage, {
      location,
      notes,
      operator
    });

    res.json({
      success: true,
      tracking: updatedTracking
    });
  } catch (error) {
    console.error('Error updating tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tracking/statistics/overview - Get tracking statistics
router.get('/statistics/overview', async (req, res) => {
  try {
    const trackingStats = trackingService.getStatistics();
    const relayStats = relaySystem.getRelayStatistics();
    const wsStats = webSocketService.getStatistics();

    res.json({
      success: true,
      statistics: {
        tracking: trackingStats,
        relay: relayStats,
        websocket: {
          activeConnections: wsStats.activeConnections,
          totalConnections: wsStats.totalConnections,
          messagesReceived: wsStats.messagesReceived,
          messagesSent: wsStats.messagesSent
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tracking/active - Get all active trackings
router.get('/active/list', async (req, res) => {
  try {
    const activeTrackings = trackingService.getAllActiveTrackings();
    
    res.json({
      success: true,
      count: activeTrackings.length,
      trackings: activeTrackings
    });
  } catch (error) {
    console.error('Error fetching active trackings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/relay/submit - Submit document to relay system
router.post('/relay/submit', async (req, res) => {
  try {
    const {
      documentData,
      priority = 'STANDARD',
      express = false,
      deliveryMethod = 'POST_OFFICE',
      preferredRelay = null
    } = req.body;

    if (!documentData || !documentData.permitNumber) {
      return res.status(400).json({
        success: false,
        error: 'Document data with permit number required'
      });
    }

    console.log(`🚀 Submitting to relay system: ${documentData.permitNumber}`);
    
    const result = await relaySystem.submitToRelay(documentData, {
      priority,
      express,
      deliveryMethod,
      preferredRelay
    });

    if (result.success) {
      res.json({
        success: true,
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error submitting to relay:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tracking/relay/job/:jobId - Get relay job details
router.get('/relay/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const jobDetails = relaySystem.getJobDetails(jobId);
    
    if (!jobDetails) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      job: jobDetails
    });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/relay/job/:jobId/cancel - Cancel relay job
router.post('/relay/job/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;
    
    const result = await relaySystem.cancelJob(jobId, reason);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/relay/job/:jobId/reschedule - Reschedule job with new priority
router.post('/relay/job/:jobId/reschedule', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { priority } = req.body;
    
    if (!priority) {
      return res.status(400).json({
        success: false,
        error: 'New priority required'
      });
    }

    const result = await relaySystem.rescheduleJob(jobId, priority);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error rescheduling job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/tracking/relay/statistics - Get relay system statistics
router.get('/relay/statistics', async (req, res) => {
  try {
    const statistics = relaySystem.getRelayStatistics();
    
    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error fetching relay statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/tracking/search - Search tracking by various criteria
router.post('/search', async (req, res) => {
  try {
    const { permitNumber, applicantName, phoneNumber } = req.body;
    
    if (!permitNumber && !applicantName && !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'At least one search criterion required'
      });
    }

    // Search through all trackings
    const results = [];
    trackingService.trackingData.forEach(tracking => {
      let match = false;
      
      if (permitNumber && tracking.permitNumber === permitNumber) {
        match = true;
      }
      if (applicantName && tracking.applicantName.toLowerCase().includes(applicantName.toLowerCase())) {
        match = true;
      }
      if (phoneNumber && tracking.notifications?.sms === phoneNumber) {
        match = true;
      }
      
      if (match) {
        results.push({
          trackingNumber: tracking.trackingNumber,
          applicantName: tracking.applicantName,
          permitNumber: tracking.permitNumber,
          currentStage: tracking.currentStage,
          estimatedCompletion: tracking.estimatedCompletion
        });
      }
    });

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching tracking:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;