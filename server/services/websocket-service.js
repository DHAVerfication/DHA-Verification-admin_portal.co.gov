import { WebSocketServer } from 'ws';
import crypto from 'crypto';
import trackingService from './tracking-service.js';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.rooms = new Map();
    this.heartbeatInterval = null;
    this.messageQueue = [];
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0
    };
  }

  // Initialize WebSocket server
  initialize(server, path = '/ws') {
    this.wss = new WebSocketServer({ 
      server, 
      path,
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.wss.on('connection', (ws, req) => this.handleConnection(ws, req));
    
    // Start heartbeat monitoring
    this.startHeartbeat();

    // Subscribe to tracking service events
    this.subscribeToTrackingEvents();

    console.log(`✅ WebSocket Service initialized on path ${path}`);
    return this.wss;
  }

  // Handle new WebSocket connection
  handleConnection(ws, req) {
    const clientId = crypto.randomUUID();
    const clientIp = req.socket.remoteAddress;
    
    // Initialize client data
    const client = {
      id: clientId,
      ws,
      ip: clientIp,
      isAlive: true,
      subscriptions: new Set(),
      rooms: new Set(),
      connectedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0
    };

    this.clients.set(clientId, client);
    this.stats.totalConnections++;
    this.stats.activeConnections++;

    console.log(`🔌 New WebSocket connection: ${clientId} from ${clientIp}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'connection',
      status: 'connected',
      clientId,
      timestamp: new Date().toISOString(),
      message: 'Connected to DHA Tracking System'
    });

    // Set up event handlers
    ws.on('message', (message) => this.handleMessage(clientId, message));
    ws.on('pong', () => this.handlePong(clientId));
    ws.on('close', () => this.handleDisconnect(clientId));
    ws.on('error', (error) => this.handleError(clientId, error));
  }

  // Handle incoming WebSocket message
  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastActivity = new Date().toISOString();
    client.messageCount++;
    this.stats.messagesReceived++;

    try {
      const data = JSON.parse(message.toString());
      
      console.log(`📨 Message from ${clientId}:`, data.type);

      switch (data.type) {
        case 'subscribe':
          this.handleSubscribe(clientId, data);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(clientId, data);
          break;
        case 'track':
          this.handleTrackRequest(clientId, data);
          break;
        case 'join_room':
          this.joinRoom(clientId, data.room);
          break;
        case 'leave_room':
          this.leaveRoom(clientId, data.room);
          break;
        case 'ping':
          this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        case 'get_status':
          this.sendSystemStatus(clientId);
          break;
        default:
          this.sendToClient(clientId, {
            type: 'error',
            message: `Unknown message type: ${data.type}`
          });
      }
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Invalid message format'
      });
      this.stats.errors++;
    }
  }

  // Handle subscription request
  handleSubscribe(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { trackingNumber } = data;
    
    if (!trackingNumber) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Tracking number required for subscription'
      });
      return;
    }

    // Get current tracking status
    const tracking = trackingService.getTracking(trackingNumber);
    
    if (!tracking) {
      this.sendToClient(clientId, {
        type: 'error',
        message: `Tracking number not found: ${trackingNumber}`
      });
      return;
    }

    // Subscribe to tracking updates
    const subscription = trackingService.subscribeToTracking(
      trackingNumber,
      (event) => this.handleTrackingUpdate(clientId, trackingNumber, event),
      clientId
    );

    client.subscriptions.add(trackingNumber);

    // Send initial tracking data
    this.sendToClient(clientId, {
      type: 'subscribed',
      trackingNumber,
      currentData: tracking,
      message: `Subscribed to tracking updates for ${trackingNumber}`
    });
  }

  // Handle unsubscribe request
  handleUnsubscribe(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { trackingNumber } = data;
    
    if (trackingNumber && client.subscriptions.has(trackingNumber)) {
      trackingService.unsubscribe(trackingNumber, clientId);
      client.subscriptions.delete(trackingNumber);
      
      this.sendToClient(clientId, {
        type: 'unsubscribed',
        trackingNumber,
        message: `Unsubscribed from ${trackingNumber}`
      });
    }
  }

  // Handle tracking request
  handleTrackRequest(clientId, data) {
    const { trackingNumber } = data;
    
    if (!trackingNumber) {
      this.sendToClient(clientId, {
        type: 'error',
        message: 'Tracking number required'
      });
      return;
    }

    const tracking = trackingService.getTracking(trackingNumber);
    
    if (!tracking) {
      this.sendToClient(clientId, {
        type: 'tracking_not_found',
        trackingNumber,
        message: 'Tracking number not found'
      });
      return;
    }

    this.sendToClient(clientId, {
      type: 'tracking_data',
      trackingNumber,
      data: tracking,
      timestamp: new Date().toISOString()
    });
  }

  // Handle tracking update from tracking service
  handleTrackingUpdate(clientId, trackingNumber, event) {
    this.sendToClient(clientId, {
      type: 'tracking_update',
      trackingNumber,
      event,
      timestamp: new Date().toISOString()
    });
  }

  // Subscribe to global tracking events
  subscribeToTrackingEvents() {
    // Listen for status updates
    trackingService.addEventListener('statusUpdate', (event) => {
      this.broadcastToSubscribers(event.trackingNumber, {
        type: 'status_update',
        trackingNumber: event.trackingNumber,
        data: event.data,
        timestamp: event.timestamp
      });
    });

    // Listen for new tracking created
    trackingService.addEventListener('created', (event) => {
      this.broadcast({
        type: 'new_tracking',
        data: event.data,
        timestamp: event.timestamp
      });
    });
  }

  // Join a room (for group notifications)
  joinRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    this.rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);

    this.sendToClient(clientId, {
      type: 'room_joined',
      room: roomName,
      message: `Joined room: ${roomName}`
    });
  }

  // Leave a room
  leaveRoom(clientId, roomName) {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(clientId);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }

    client.rooms.delete(roomName);

    this.sendToClient(clientId, {
      type: 'room_left',
      room: roomName,
      message: `Left room: ${roomName}`
    });
  }

  // Send message to specific client
  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== 1) return false;

    try {
      client.ws.send(JSON.stringify(data));
      this.stats.messagesSent++;
      return true;
    } catch (error) {
      console.error(`Error sending to client ${clientId}:`, error);
      this.stats.errors++;
      return false;
    }
  }

  // Broadcast to all connected clients
  broadcast(data, excludeClientId = null) {
    let sent = 0;
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId && client.ws.readyState === 1) {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      }
    });
    return sent;
  }

  // Broadcast to subscribers of a specific tracking number
  broadcastToSubscribers(trackingNumber, data) {
    let sent = 0;
    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(trackingNumber)) {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      }
    });
    console.log(`📡 Broadcast to ${sent} subscribers of ${trackingNumber}`);
    return sent;
  }

  // Broadcast to room members
  broadcastToRoom(roomName, data, excludeClientId = null) {
    if (!this.rooms.has(roomName)) return 0;

    let sent = 0;
    this.rooms.get(roomName).forEach((clientId) => {
      if (clientId !== excludeClientId) {
        if (this.sendToClient(clientId, data)) {
          sent++;
        }
      }
    });
    return sent;
  }

  // Send system status to client
  sendSystemStatus(clientId) {
    const trackingStats = trackingService.getStatistics();
    
    this.sendToClient(clientId, {
      type: 'system_status',
      websocket: {
        activeConnections: this.stats.activeConnections,
        totalConnections: this.stats.totalConnections,
        messagesReceived: this.stats.messagesReceived,
        messagesSent: this.stats.messagesSent,
        errors: this.stats.errors
      },
      tracking: trackingStats,
      timestamp: new Date().toISOString()
    });
  }

  // Handle pong response (heartbeat)
  handlePong(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      client.isAlive = true;
      client.lastActivity = new Date().toISOString();
    }
  }

  // Handle client disconnect
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    console.log(`🔌 WebSocket disconnected: ${clientId}`);

    // Unsubscribe from all tracking
    client.subscriptions.forEach(trackingNumber => {
      trackingService.unsubscribe(trackingNumber, clientId);
    });

    // Leave all rooms
    client.rooms.forEach(roomName => {
      this.leaveRoom(clientId, roomName);
    });

    // Remove client
    this.clients.delete(clientId);
    this.stats.activeConnections--;
  }

  // Handle WebSocket error
  handleError(clientId, error) {
    console.error(`WebSocket error for client ${clientId}:`, error);
    this.stats.errors++;
  }

  // Start heartbeat interval
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (client.isAlive === false) {
          console.log(`💔 Terminating inactive connection: ${clientId}`);
          client.ws.terminate();
          this.handleDisconnect(clientId);
          return;
        }

        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000); // Ping every 30 seconds
  }

  // Stop heartbeat interval
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Shutdown WebSocket service
  shutdown() {
    console.log('🔌 Shutting down WebSocket service...');
    
    // Stop heartbeat
    this.stopHeartbeat();

    // Close all client connections
    this.clients.forEach((client) => {
      client.ws.close(1000, 'Server shutdown');
    });

    // Clear data
    this.clients.clear();
    this.rooms.clear();

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
    }

    console.log('✅ WebSocket service shut down');
  }

  // Get service statistics
  getStatistics() {
    return {
      ...this.stats,
      rooms: this.rooms.size,
      clientDetails: Array.from(this.clients.values()).map(client => ({
        id: client.id,
        ip: client.ip,
        connectedAt: client.connectedAt,
        lastActivity: client.lastActivity,
        messageCount: client.messageCount,
        subscriptions: Array.from(client.subscriptions),
        rooms: Array.from(client.rooms)
      }))
    };
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;