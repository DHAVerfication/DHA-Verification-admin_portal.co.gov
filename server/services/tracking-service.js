import crypto from 'crypto';
import { prebookedGWPOrders } from './gwp-bookings.js';

// Document tracking stages with detailed status progression
export const TRACKING_STAGES = {
  QUEUED: 'Queued',
  PRINTING: 'Printing',
  QUALITY_CHECK: 'Quality Check',
  PACKAGING: 'Packaging',
  DISPATCHED: 'Dispatched',
  IN_TRANSIT: 'In Transit',
  READY_FOR_COLLECTION: 'Ready for Collection',
  COLLECTED: 'Collected'
};

// Stage durations in minutes for simulation
const STAGE_DURATIONS = {
  QUEUED: 15,
  PRINTING: 30,
  QUALITY_CHECK: 10,
  PACKAGING: 20,
  DISPATCHED: 5,
  IN_TRANSIT: 1440, // 24 hours
  READY_FOR_COLLECTION: 0
};

class TrackingService {
  constructor() {
    this.trackingData = new Map();
    this.subscribers = new Map();
    this.eventListeners = new Map();
    this.notificationQueue = [];
    
    // Initialize tracking for all pre-booked GWP orders
    this.initializeGWPTracking();
    
    // Start automatic progression simulation
    this.startProgressionSimulation();
    
    console.log('✅ Tracking Service initialized with real-time capabilities');
  }

  // Initialize tracking for existing GWP bookings
  initializeGWPTracking() {
    prebookedGWPOrders.forEach(order => {
      const trackingInfo = {
        trackingNumber: order.trackingNumber,
        orderNumber: order.orderNumber,
        applicantName: order.name,
        permitNumber: order.permitNumber,
        currentStage: TRACKING_STAGES.PRINTING,
        previousStages: [{
          stage: TRACKING_STAGES.QUEUED,
          timestamp: new Date(order.bookingDate).toISOString(),
          location: 'DHA Back Office',
          notes: 'Document submitted for printing'
        }],
        estimatedCompletion: order.readyDate,
        collectionMethod: order.collectionMethod,
        collectionLocation: order.collectionLocation,
        deliverySpeed: order.deliverySpeed,
        priority: order.deliverySpeed.includes('Express') ? 'HIGH' : 'STANDARD',
        notifications: {
          sms: order.phoneNumber,
          email: order.email || null
        },
        metadata: {
          cost: order.cost,
          paid: order.paid,
          paymentRef: order.paymentRef,
          expiryDate: order.expiryDate
        },
        createdAt: new Date(order.bookingDate).toISOString(),
        lastUpdated: new Date().toISOString()
      };

      this.trackingData.set(order.trackingNumber, trackingInfo);
    });
  }

  // Create new tracking entry
  createTracking(documentData) {
    const trackingNumber = this.generateTrackingNumber();
    
    const trackingInfo = {
      trackingNumber,
      orderNumber: documentData.orderNumber,
      applicantName: documentData.name,
      permitNumber: documentData.permitNumber,
      documentType: documentData.type,
      currentStage: TRACKING_STAGES.QUEUED,
      previousStages: [],
      estimatedCompletion: this.calculateEstimatedCompletion(documentData.priority),
      priority: documentData.priority || 'STANDARD',
      collectionMethod: documentData.collectionMethod || 'Post Office',
      collectionLocation: documentData.collectionLocation,
      notifications: {
        sms: documentData.phoneNumber,
        email: documentData.email
      },
      metadata: documentData.metadata || {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.trackingData.set(trackingNumber, trackingInfo);
    this.emitTrackingEvent(trackingNumber, 'created', trackingInfo);
    
    return trackingInfo;
  }

  // Update tracking status
  updateStatus(trackingNumber, newStage, additionalInfo = {}) {
    const tracking = this.trackingData.get(trackingNumber);
    if (!tracking) {
      throw new Error(`Tracking number ${trackingNumber} not found`);
    }

    // Archive current stage to history
    if (tracking.currentStage) {
      tracking.previousStages.push({
        stage: tracking.currentStage,
        timestamp: tracking.lastUpdated,
        location: additionalInfo.location || 'Processing Center',
        notes: additionalInfo.notes || `Stage completed: ${tracking.currentStage}`,
        operator: additionalInfo.operator || 'SYSTEM'
      });
    }

    // Update to new stage
    tracking.currentStage = newStage;
    tracking.lastUpdated = new Date().toISOString();
    
    // Update location and other metadata if provided
    if (additionalInfo.location) {
      tracking.currentLocation = additionalInfo.location;
    }
    
    if (additionalInfo.estimatedCompletion) {
      tracking.estimatedCompletion = additionalInfo.estimatedCompletion;
    }

    // Calculate progress percentage
    tracking.progressPercentage = this.calculateProgress(tracking);

    this.trackingData.set(trackingNumber, tracking);
    
    // Emit update event for WebSocket broadcasting
    this.emitTrackingEvent(trackingNumber, 'statusUpdate', {
      trackingNumber,
      newStage,
      timestamp: tracking.lastUpdated,
      progress: tracking.progressPercentage,
      details: additionalInfo
    });

    // Queue notifications
    this.queueNotification(tracking, newStage);

    return tracking;
  }

  // Get tracking information
  getTracking(trackingNumber) {
    const tracking = this.trackingData.get(trackingNumber);
    if (!tracking) {
      // Check if it's a GWP order
      const gwpOrder = prebookedGWPOrders.find(o => o.trackingNumber === trackingNumber);
      if (gwpOrder) {
        return this.createTrackingFromGWPOrder(gwpOrder);
      }
      return null;
    }
    
    // Add real-time status
    tracking.isLive = true;
    tracking.progressPercentage = this.calculateProgress(tracking);
    tracking.estimatedTimeRemaining = this.calculateTimeRemaining(tracking);
    
    return tracking;
  }

  // Get tracking history
  getTrackingHistory(trackingNumber) {
    const tracking = this.trackingData.get(trackingNumber);
    if (!tracking) {
      return null;
    }

    const history = [...tracking.previousStages];
    
    // Add current stage to history
    if (tracking.currentStage) {
      history.push({
        stage: tracking.currentStage,
        timestamp: tracking.lastUpdated,
        location: tracking.currentLocation || 'Processing',
        notes: `Currently in: ${tracking.currentStage}`,
        isCurrent: true
      });
    }

    return {
      trackingNumber,
      applicantName: tracking.applicantName,
      permitNumber: tracking.permitNumber,
      totalStages: history.length,
      history: history.reverse(), // Most recent first
      createdAt: tracking.createdAt,
      estimatedCompletion: tracking.estimatedCompletion
    };
  }

  // Subscribe to tracking updates
  subscribeToTracking(trackingNumber, callback, subscriberId = null) {
    if (!this.subscribers.has(trackingNumber)) {
      this.subscribers.set(trackingNumber, new Map());
    }
    
    const id = subscriberId || crypto.randomUUID();
    this.subscribers.get(trackingNumber).set(id, callback);
    
    return {
      trackingNumber,
      subscriberId: id,
      unsubscribe: () => this.unsubscribe(trackingNumber, id)
    };
  }

  // Unsubscribe from tracking
  unsubscribe(trackingNumber, subscriberId) {
    if (this.subscribers.has(trackingNumber)) {
      this.subscribers.get(trackingNumber).delete(subscriberId);
    }
  }

  // Emit tracking event to all subscribers
  emitTrackingEvent(trackingNumber, eventType, data) {
    // Notify specific tracking subscribers
    if (this.subscribers.has(trackingNumber)) {
      this.subscribers.get(trackingNumber).forEach(callback => {
        try {
          callback({ eventType, data, timestamp: new Date().toISOString() });
        } catch (error) {
          console.error(`Error notifying subscriber: ${error.message}`);
        }
      });
    }

    // Notify global event listeners
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(listener => {
        try {
          listener({ trackingNumber, data, timestamp: new Date().toISOString() });
        } catch (error) {
          console.error(`Error notifying listener: ${error.message}`);
        }
      });
    }
  }

  // Add global event listener
  addEventListener(eventType, listener) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(listener);
  }

  // Queue notification for SMS/Email
  queueNotification(tracking, stage) {
    const criticalStages = [
      TRACKING_STAGES.DISPATCHED,
      TRACKING_STAGES.READY_FOR_COLLECTION
    ];

    if (criticalStages.includes(stage)) {
      const notification = {
        id: crypto.randomUUID(),
        trackingNumber: tracking.trackingNumber,
        recipientName: tracking.applicantName,
        stage,
        channels: [],
        message: this.generateNotificationMessage(tracking, stage),
        timestamp: new Date().toISOString(),
        status: 'QUEUED'
      };

      if (tracking.notifications.sms) {
        notification.channels.push({
          type: 'SMS',
          destination: tracking.notifications.sms
        });
      }

      if (tracking.notifications.email) {
        notification.channels.push({
          type: 'EMAIL',
          destination: tracking.notifications.email
        });
      }

      this.notificationQueue.push(notification);
      this.processNotificationQueue();
    }
  }

  // Process notification queue
  async processNotificationQueue() {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      for (const channel of notification.channels) {
        try {
          // In production, this would integrate with SMS/Email services
          console.log(`📨 Sending ${channel.type} notification to ${channel.destination}`);
          console.log(`   Message: ${notification.message}`);
          
          notification.status = 'SENT';
          notification.sentAt = new Date().toISOString();
        } catch (error) {
          console.error(`Failed to send ${channel.type} notification:`, error);
          notification.status = 'FAILED';
          notification.error = error.message;
        }
      }
    }
  }

  // Generate notification message
  generateNotificationMessage(tracking, stage) {
    const messages = {
      [TRACKING_STAGES.DISPATCHED]: `Dear ${tracking.applicantName}, your document (${tracking.permitNumber}) has been dispatched. Track: ${tracking.trackingNumber}`,
      [TRACKING_STAGES.READY_FOR_COLLECTION]: `Dear ${tracking.applicantName}, your document is ready for collection at ${tracking.collectionLocation}. Reference: ${tracking.trackingNumber}`,
      [TRACKING_STAGES.IN_TRANSIT]: `Dear ${tracking.applicantName}, your document is in transit to ${tracking.collectionLocation}. Expected arrival: ${tracking.estimatedCompletion}`
    };

    return messages[stage] || `Status update for ${tracking.trackingNumber}: ${stage}`;
  }

  // Calculate progress percentage
  calculateProgress(tracking) {
    const stages = Object.keys(TRACKING_STAGES);
    const currentIndex = stages.findIndex(s => TRACKING_STAGES[s] === tracking.currentStage);
    const totalStages = stages.length - 1; // Exclude 'COLLECTED'
    
    return Math.round((currentIndex / totalStages) * 100);
  }

  // Calculate estimated time remaining
  calculateTimeRemaining(tracking) {
    if (tracking.currentStage === TRACKING_STAGES.READY_FOR_COLLECTION ||
        tracking.currentStage === TRACKING_STAGES.COLLECTED) {
      return 0;
    }

    const estimatedDate = new Date(tracking.estimatedCompletion);
    const now = new Date();
    const diffMs = estimatedDate - now;
    
    if (diffMs <= 0) return 0;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, formatted: `${hours}h ${minutes}m` };
  }

  // Calculate estimated completion date
  calculateEstimatedCompletion(priority) {
    const now = new Date();
    const daysToAdd = priority === 'HIGH' ? 2 : 4;
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString().split('T')[0];
  }

  // Generate tracking number
  generateTrackingNumber() {
    const prefix = 'SAPO';
    const location = ['RB', 'SD', 'CR', 'PTA'][Math.floor(Math.random() * 4)];
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const sequence = String(this.trackingData.size + 1).padStart(3, '0');
    
    return `${prefix}-${location}-${date}-${sequence}`;
  }

  // Create tracking from GWP order
  createTrackingFromGWPOrder(gwpOrder) {
    const tracking = {
      trackingNumber: gwpOrder.trackingNumber,
      orderNumber: gwpOrder.orderNumber,
      applicantName: gwpOrder.name,
      permitNumber: gwpOrder.permitNumber,
      currentStage: this.determineStageFromStatus(gwpOrder.status),
      previousStages: [],
      estimatedCompletion: gwpOrder.readyDate,
      collectionMethod: gwpOrder.collectionMethod,
      collectionLocation: gwpOrder.collectionLocation,
      priority: gwpOrder.deliverySpeed.includes('Express') ? 'HIGH' : 'STANDARD',
      isLive: true,
      progressPercentage: 25,
      metadata: {
        cost: gwpOrder.cost,
        paid: gwpOrder.paid,
        paymentRef: gwpOrder.paymentRef
      }
    };

    return tracking;
  }

  // Determine stage from GWP status
  determineStageFromStatus(status) {
    const statusMap = {
      'SCHEDULED_FOR_PRINTING': TRACKING_STAGES.QUEUED,
      'PRINTING': TRACKING_STAGES.PRINTING,
      'QUALITY_CHECK': TRACKING_STAGES.QUALITY_CHECK,
      'PACKAGING': TRACKING_STAGES.PACKAGING,
      'DISPATCHED': TRACKING_STAGES.DISPATCHED,
      'IN_TRANSIT': TRACKING_STAGES.IN_TRANSIT,
      'READY': TRACKING_STAGES.READY_FOR_COLLECTION
    };

    return statusMap[status] || TRACKING_STAGES.QUEUED;
  }

  // Simulate automatic progression through stages (for demo)
  startProgressionSimulation() {
    setInterval(() => {
      this.trackingData.forEach((tracking, trackingNumber) => {
        if (tracking.currentStage === TRACKING_STAGES.COLLECTED) {
          return; // Don't progress completed orders
        }

        // Random chance to progress to next stage
        if (Math.random() > 0.7) {
          const stages = Object.values(TRACKING_STAGES);
          const currentIndex = stages.indexOf(tracking.currentStage);
          
          if (currentIndex < stages.length - 2) { // Don't auto-progress to COLLECTED
            const nextStage = stages[currentIndex + 1];
            this.updateStatus(trackingNumber, nextStage, {
              location: this.getLocationForStage(nextStage),
              notes: `Automated progression to ${nextStage}`,
              operator: 'AUTO_SYSTEM'
            });
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  // Get location for stage
  getLocationForStage(stage) {
    const locations = {
      [TRACKING_STAGES.QUEUED]: 'DHA Back Office',
      [TRACKING_STAGES.PRINTING]: 'GWP Printing Facility',
      [TRACKING_STAGES.QUALITY_CHECK]: 'Quality Control Department',
      [TRACKING_STAGES.PACKAGING]: 'Packaging Center',
      [TRACKING_STAGES.DISPATCHED]: 'Distribution Hub',
      [TRACKING_STAGES.IN_TRANSIT]: 'In Transit',
      [TRACKING_STAGES.READY_FOR_COLLECTION]: 'Collection Point'
    };

    return locations[stage] || 'Processing Center';
  }

  // Get all active trackings
  getAllActiveTrackings() {
    const active = [];
    this.trackingData.forEach(tracking => {
      if (tracking.currentStage !== TRACKING_STAGES.COLLECTED) {
        active.push({
          trackingNumber: tracking.trackingNumber,
          applicantName: tracking.applicantName,
          currentStage: tracking.currentStage,
          progress: this.calculateProgress(tracking),
          priority: tracking.priority
        });
      }
    });
    return active;
  }

  // Get statistics
  getStatistics() {
    let stats = {
      total: this.trackingData.size,
      byStage: {},
      byPriority: { HIGH: 0, STANDARD: 0 },
      averageProcessingTime: 0
    };

    this.trackingData.forEach(tracking => {
      // Count by stage
      if (!stats.byStage[tracking.currentStage]) {
        stats.byStage[tracking.currentStage] = 0;
      }
      stats.byStage[tracking.currentStage]++;

      // Count by priority
      stats.byPriority[tracking.priority]++;
    });

    return stats;
  }
}

// Export singleton instance
export const trackingService = new TrackingService();
export default trackingService;