import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/secrets.js';
import trackingService from './tracking-service.js';
import { prebookedGWPOrders } from './gwp-bookings.js';

// Relay network configuration
const RELAY_NETWORKS = {
  DHA_CENTRAL: {
    id: 'DHA_CENTRAL',
    name: 'DHA Central Printing Hub',
    location: 'Pretoria',
    capacity: 10000,
    priority: 1,
    capabilities: ['PASSPORT', 'ID_CARD', 'PERMIT', 'CERTIFICATE'],
    status: 'ONLINE'
  },
  GWP_MAIN: {
    id: 'GWP_MAIN',
    name: 'Government Warehouse & Printing',
    location: 'Johannesburg',
    capacity: 50000,
    priority: 2,
    capabilities: ['ALL_DOCUMENTS'],
    status: 'ONLINE'
  },
  REGIONAL_WEST: {
    id: 'REGIONAL_WEST',
    name: 'Western Cape Regional Facility',
    location: 'Cape Town',
    capacity: 5000,
    priority: 3,
    capabilities: ['PERMIT', 'CERTIFICATE', 'EVISA'],
    status: 'ONLINE'
  },
  REGIONAL_EAST: {
    id: 'REGIONAL_EAST',
    name: 'KwaZulu-Natal Regional Facility',
    location: 'Durban',
    capacity: 5000,
    priority: 3,
    capabilities: ['PERMIT', 'CERTIFICATE'],
    status: 'ONLINE'
  }
};

// Print queue priorities
const QUEUE_PRIORITIES = {
  EMERGENCY: 0,
  EXPRESS: 1,
  HIGH: 2,
  STANDARD: 3,
  LOW: 4
};

class RelaySystem {
  constructor() {
    this.printQueues = new Map();
    this.activeJobs = new Map();
    this.completedJobs = new Map();
    this.relayStatus = new Map();
    this.jobCounter = 0;
    
    // Initialize relay networks
    this.initializeRelays();
    
    // Start monitoring
    this.startRelayMonitoring();
    
    console.log('✅ Relay System initialized with DHA printing network');
  }

  // Initialize relay network connections
  initializeRelays() {
    Object.values(RELAY_NETWORKS).forEach(relay => {
      this.relayStatus.set(relay.id, {
        ...relay,
        currentLoad: 0,
        queueLength: 0,
        avgProcessingTime: 120, // minutes
        lastHeartbeat: new Date().toISOString(),
        activeJobs: 0
      });
      
      // Initialize queue for each relay
      this.printQueues.set(relay.id, []);
    });
  }

  // Submit document to relay printing network
  async submitToRelay(documentData, options = {}) {
    try {
      const {
        priority = 'STANDARD',
        preferredRelay = null,
        deliveryMethod = 'POST_OFFICE',
        express = false
      } = options;

      console.log(`📨 Submitting document to relay network...`);
      console.log(`   Document: ${documentData.permitNumber}`);
      console.log(`   Priority: ${priority}`);
      console.log(`   Express: ${express}`);

      // Select optimal relay
      const relay = this.selectOptimalRelay(documentData, preferredRelay);
      
      if (!relay) {
        throw new Error('No available relay stations');
      }

      // Create print job
      const printJob = {
        id: this.generateJobId(),
        documentData,
        relayId: relay.id,
        priority: express ? 'EXPRESS' : priority,
        queuePriority: QUEUE_PRIORITIES[express ? 'EXPRESS' : priority],
        submittedAt: new Date().toISOString(),
        estimatedCompletion: this.calculateEstimatedCompletion(relay, priority, express),
        status: 'QUEUED',
        deliveryMethod,
        retryCount: 0,
        metadata: {
          applicantName: documentData.name,
          permitNumber: documentData.permitNumber,
          documentType: documentData.type,
          tracking: null
        }
      };

      // Create tracking entry
      const tracking = trackingService.createTracking({
        ...documentData,
        orderNumber: printJob.id,
        priority: printJob.priority,
        collectionMethod: deliveryMethod,
        collectionLocation: documentData.collectionLocation
      });

      printJob.metadata.tracking = tracking.trackingNumber;

      // Submit to relay
      const result = await this.submitJobToRelay(relay, printJob);
      
      if (result.success) {
        // Add to active jobs
        this.activeJobs.set(printJob.id, printJob);
        
        // Add to relay queue
        this.addToQueue(relay.id, printJob);
        
        // Update relay status
        this.updateRelayStatus(relay.id, {
          currentLoad: relay.currentLoad + 1,
          queueLength: this.printQueues.get(relay.id).length,
          activeJobs: relay.activeJobs + 1
        });

        console.log(`✅ Print job submitted successfully`);
        console.log(`   Job ID: ${printJob.id}`);
        console.log(`   Relay: ${relay.name}`);
        console.log(`   Queue Position: ${result.queuePosition}`);
        console.log(`   Tracking: ${tracking.trackingNumber}`);

        return {
          success: true,
          jobId: printJob.id,
          relayId: relay.id,
          relayName: relay.name,
          trackingNumber: tracking.trackingNumber,
          queuePosition: result.queuePosition,
          estimatedCompletion: printJob.estimatedCompletion,
          status: 'SUBMITTED'
        };
      } else {
        throw new Error(result.error || 'Failed to submit to relay');
      }
    } catch (error) {
      console.error('❌ Relay submission error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Submit job to specific relay
  async submitJobToRelay(relay, printJob) {
    try {
      // In production, this would connect to actual relay API
      if (config.production.useProductionApis && config.dha.relayApiKey) {
        const response = await axios.post(
          `${config.endpoints.relay}/${relay.id}/submit`,
          {
            jobId: printJob.id,
            documentData: printJob.documentData,
            priority: printJob.priority,
            metadata: printJob.metadata
          },
          {
            headers: {
              'Authorization': `Bearer ${config.dha.relayApiKey}`,
              'X-Relay-ID': relay.id,
              'X-Priority': printJob.priority
            },
            timeout: 10000
          }
        );

        return {
          success: true,
          queuePosition: response.data.queuePosition || this.getQueuePosition(relay.id, printJob.id),
          relayResponse: response.data
        };
      } else {
        // Simulated submission for development
        return {
          success: true,
          queuePosition: this.getQueuePosition(relay.id, printJob.id),
          simulated: true
        };
      }
    } catch (error) {
      console.error(`Failed to submit to relay ${relay.id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Select optimal relay based on load and capabilities
  selectOptimalRelay(documentData, preferredRelayId = null) {
    // Check preferred relay first
    if (preferredRelayId && this.relayStatus.has(preferredRelayId)) {
      const relay = this.relayStatus.get(preferredRelayId);
      if (relay.status === 'ONLINE' && this.canHandleDocument(relay, documentData.type)) {
        return relay;
      }
    }

    // Find best available relay
    let bestRelay = null;
    let lowestLoad = Infinity;

    this.relayStatus.forEach(relay => {
      if (relay.status === 'ONLINE' && this.canHandleDocument(relay, documentData.type)) {
        const loadScore = this.calculateLoadScore(relay);
        if (loadScore < lowestLoad) {
          lowestLoad = loadScore;
          bestRelay = relay;
        }
      }
    });

    return bestRelay;
  }

  // Check if relay can handle document type
  canHandleDocument(relay, documentType) {
    return relay.capabilities.includes('ALL_DOCUMENTS') || 
           relay.capabilities.includes(documentType);
  }

  // Calculate load score for relay selection
  calculateLoadScore(relay) {
    const loadPercentage = (relay.currentLoad / relay.capacity) * 100;
    const queueWeight = relay.queueLength * 2;
    const priorityWeight = (5 - relay.priority) * 10;
    
    return loadPercentage + queueWeight - priorityWeight;
  }

  // Add job to relay queue
  addToQueue(relayId, printJob) {
    const queue = this.printQueues.get(relayId);
    
    // Insert based on priority
    let inserted = false;
    for (let i = 0; i < queue.length; i++) {
      if (printJob.queuePriority < queue[i].queuePriority) {
        queue.splice(i, 0, printJob);
        inserted = true;
        break;
      }
    }
    
    if (!inserted) {
      queue.push(printJob);
    }
  }

  // Get queue position
  getQueuePosition(relayId, jobId) {
    const queue = this.printQueues.get(relayId);
    return queue.findIndex(job => job.id === jobId) + 1;
  }

  // Update job status
  async updateJobStatus(jobId, newStatus, additionalData = {}) {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      console.error(`Job ${jobId} not found`);
      return false;
    }

    job.status = newStatus;
    job.lastUpdated = new Date().toISOString();
    
    // Update additional data
    Object.assign(job, additionalData);

    // Update tracking if available
    if (job.metadata.tracking) {
      const trackingStage = this.mapStatusToTrackingStage(newStatus);
      if (trackingStage) {
        trackingService.updateStatus(job.metadata.tracking, trackingStage, {
          location: this.relayStatus.get(job.relayId).location,
          notes: `Print job status: ${newStatus}`
        });
      }
    }

    // Move to completed if done
    if (['COMPLETED', 'DELIVERED', 'FAILED'].includes(newStatus)) {
      this.completedJobs.set(jobId, job);
      this.activeJobs.delete(jobId);
      
      // Remove from queue
      const queue = this.printQueues.get(job.relayId);
      const index = queue.findIndex(j => j.id === jobId);
      if (index > -1) {
        queue.splice(index, 1);
      }
    }

    console.log(`📋 Job ${jobId} status updated to ${newStatus}`);
    return true;
  }

  // Map relay status to tracking stage
  mapStatusToTrackingStage(status) {
    const statusMap = {
      'QUEUED': 'Queued',
      'PROCESSING': 'Printing',
      'PRINTING': 'Printing',
      'QUALITY_CHECK': 'Quality Check',
      'PACKAGING': 'Packaging',
      'READY_FOR_DISPATCH': 'Packaging',
      'DISPATCHED': 'Dispatched',
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Ready for Collection',
      'COMPLETED': 'Ready for Collection'
    };

    return statusMap[status];
  }

  // Process print queues (simulated processing)
  async processQueues() {
    for (const [relayId, queue] of this.printQueues.entries()) {
      if (queue.length === 0) continue;

      const relay = this.relayStatus.get(relayId);
      
      // Process jobs based on relay capacity
      const jobsToProcess = Math.min(
        Math.floor(relay.capacity / 100), // Process 1% of capacity per cycle
        queue.length
      );

      for (let i = 0; i < jobsToProcess; i++) {
        const job = queue[0]; // Get first job (highest priority)
        
        if (job.status === 'QUEUED') {
          await this.updateJobStatus(job.id, 'PROCESSING');
        } else if (job.status === 'PROCESSING') {
          // Simulate processing stages
          const stages = ['PRINTING', 'QUALITY_CHECK', 'PACKAGING', 'READY_FOR_DISPATCH'];
          const currentIndex = stages.indexOf(job.status);
          
          if (currentIndex < stages.length - 1) {
            await this.updateJobStatus(job.id, stages[currentIndex + 1]);
          } else {
            await this.updateJobStatus(job.id, 'DISPATCHED');
          }
        }
      }
    }
  }

  // Calculate estimated completion
  calculateEstimatedCompletion(relay, priority, express) {
    const baseTime = relay.avgProcessingTime; // minutes
    const priorityMultiplier = {
      EMERGENCY: 0.25,
      EXPRESS: 0.5,
      HIGH: 0.75,
      STANDARD: 1,
      LOW: 1.5
    };

    const estimatedMinutes = baseTime * priorityMultiplier[priority];
    const completion = new Date();
    completion.setMinutes(completion.getMinutes() + estimatedMinutes);

    // If express, guarantee within 2 working days
    if (express) {
      const maxExpress = new Date();
      maxExpress.setDate(maxExpress.getDate() + 2);
      if (completion > maxExpress) {
        return maxExpress.toISOString();
      }
    }

    return completion.toISOString();
  }

  // Update relay status
  updateRelayStatus(relayId, updates) {
    const relay = this.relayStatus.get(relayId);
    if (relay) {
      Object.assign(relay, updates);
      relay.lastUpdated = new Date().toISOString();
    }
  }

  // Start relay monitoring
  startRelayMonitoring() {
    // Monitor relay health
    setInterval(() => {
      this.relayStatus.forEach((relay, relayId) => {
        // Simulate heartbeat check
        const lastHeartbeat = new Date(relay.lastHeartbeat);
        const now = new Date();
        const diffMinutes = (now - lastHeartbeat) / (1000 * 60);
        
        if (diffMinutes > 5) {
          relay.status = 'OFFLINE';
          console.warn(`⚠️ Relay ${relayId} is offline`);
        } else {
          relay.status = 'ONLINE';
        }
        
        // Update heartbeat
        relay.lastHeartbeat = now.toISOString();
      });
    }, 60000); // Check every minute

    // Process queues
    setInterval(() => {
      this.processQueues();
    }, 30000); // Process every 30 seconds
  }

  // Generate unique job ID
  generateJobId() {
    this.jobCounter++;
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `RELAY-${timestamp}-${random}-${this.jobCounter}`;
  }

  // Get relay statistics
  getRelayStatistics() {
    const stats = {
      totalRelays: this.relayStatus.size,
      onlineRelays: 0,
      totalCapacity: 0,
      currentLoad: 0,
      activeJobs: this.activeJobs.size,
      completedJobs: this.completedJobs.size,
      relays: []
    };

    this.relayStatus.forEach(relay => {
      if (relay.status === 'ONLINE') {
        stats.onlineRelays++;
      }
      stats.totalCapacity += relay.capacity;
      stats.currentLoad += relay.currentLoad;
      
      stats.relays.push({
        id: relay.id,
        name: relay.name,
        status: relay.status,
        load: `${Math.round((relay.currentLoad / relay.capacity) * 100)}%`,
        queueLength: this.printQueues.get(relay.id).length,
        avgProcessingTime: relay.avgProcessingTime
      });
    });

    stats.utilizationRate = Math.round((stats.currentLoad / stats.totalCapacity) * 100);

    return stats;
  }

  // Get job details
  getJobDetails(jobId) {
    return this.activeJobs.get(jobId) || this.completedJobs.get(jobId);
  }

  // Cancel job
  async cancelJob(jobId, reason = 'User requested') {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found or already completed'
      };
    }

    if (['DISPATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(job.status)) {
      return {
        success: false,
        error: 'Cannot cancel job in current status'
      };
    }

    await this.updateJobStatus(jobId, 'CANCELLED', {
      cancelledAt: new Date().toISOString(),
      cancelReason: reason
    });

    return {
      success: true,
      message: 'Job cancelled successfully'
    };
  }

  // Reschedule job with higher priority
  async rescheduleJob(jobId, newPriority) {
    const job = this.activeJobs.get(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found'
      };
    }

    // Remove from current position
    const queue = this.printQueues.get(job.relayId);
    const index = queue.findIndex(j => j.id === jobId);
    if (index > -1) {
      queue.splice(index, 1);
    }

    // Update priority
    job.priority = newPriority;
    job.queuePriority = QUEUE_PRIORITIES[newPriority];
    job.rescheduledAt = new Date().toISOString();

    // Re-add to queue with new priority
    this.addToQueue(job.relayId, job);

    return {
      success: true,
      newPosition: this.getQueuePosition(job.relayId, jobId),
      message: `Job rescheduled with ${newPriority} priority`
    };
  }
}

// Export singleton instance
export const relaySystem = new RelaySystem();
export default relaySystem;