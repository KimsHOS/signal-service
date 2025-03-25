// const http = require('http');
// const { Server } = require('socket.io');

// // Create an HTTP server
// const server = http.createServer();
// const io = new Server(server, {
//   cors: {
//     origin: "*", // Allow all origins (adjust as needed for security)
//     methods: ["GET", "POST"]
//   }
// });

// const users = {}; // Maps user IDs to socket connections

// console.log('Signaling server running on http://0.0.0.0:8080');

// io.on('connection', (socket) => {
//   console.log('New client connected:', socket.id);

//   // Handle registration
//   socket.on('register', (data) => {
//     console.log(`Register request from ID: ${data.id}`);
//     if (!data.id || users[data.id]) {
//       socket.emit('error', { message: 'ID invalid or already taken' });
//       console.log(`Registration failed for ID: ${data.id}`);
//     } else {
//       users[data.id] = socket;
//       socket.id = data.id; // Assign the user ID to the socket
//       socket.emit('registered', { from: 'server', id: data.id });
//       console.log(`User ${data.id} registered successfully`);
//     }
//   });

//   // Handle offer
//   socket.on('offer', (data) => {
//     console.log(`Offer from ${data.from} to ${data.to}`);
//     const recipientSocket = users[data.to];
//     if (recipientSocket) {
//       recipientSocket.emit('offer', { type: 'offer', from: data.from, to: data.to, sdp: data.sdp });
//       console.log(`Offer sent to ${data.to}`);
//     } else {
//       socket.emit('error', { message: `User ${data.to} offline` });
//       console.log(`Offer failed: User ${data.to} is offline`);
//     }
//   });

//   // Handle answer
//   socket.on('answer', (data) => {
//     console.log(`Answer from ${data.from} to ${data.to}`);
//     const recipientSocket = users[data.to];
//     if (recipientSocket) {
//       recipientSocket.emit('answer', { type: 'answer', from: data.from, to: data.to, sdp: data.sdp });
//       console.log(`Answer sent to ${data.to}`);
//     } else {
//       console.log(`Answer failed: User ${data.to} is offline`);
//     }
//   });

//   // Handle ICE candidate
//   socket.on('candidate', (data) => {
//     console.log(`Candidate from ${data.from} to ${data.to}`);
//     const recipientSocket = users[data.to];
//     if (recipientSocket) {
//       recipientSocket.emit('candidate', { type: 'candidate', from: data.from, to: data.to, candidate: data.candidate });
//       console.log(`Candidate sent to ${data.to}`);
//     } else {
//       console.log(`Candidate failed: User ${data.to} is offline`);
//     }
//   });

//   // Handle hangup
//   socket.on('hangup', (data) => {
//     console.log(`Hangup from ${data.from} to ${data.to}`);
//     const recipientSocket = users[data.to];
//     if (recipientSocket) {
//       recipientSocket.emit('hangup', { type: 'hangup', from: data.from, to: data.to });
//       console.log(`Hangup sent to ${data.to}`);
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     if (socket.id) {
//       delete users[socket.id];
//       console.log(`User ${socket.id} disconnected`);
//     }
//   });

//   // Handle errors
//   socket.on('error', (error) => {
//     console.error('Socket error:', error);
//   });
// });

// // Start the server
// server.listen(8080, '0.0.0.0' ,() => {
//   console.log('Signaling server running on http://localhost:8080');
// });

////////////////////////////////////////////////////////////////////////////////////////////////////

// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: 8080 });

// const users = {}; // Maps user IDs to WebSocket connections

// console.log('Signaling server running on ws://localhost:8080');

// wss.on('connection', (ws) => {
//   console.log('New client connected');

//   ws.on('message', (message) => {
//     console.log(`Received message: ${message}`);
//     try {
//       const data = JSON.parse(message);

//       switch (data.type) {
//         case 'register':
//           console.log(`Register request from ID: ${data.id}`);
//           if (!data.id || users[data.id]) {
//             ws.send(JSON.stringify({ type: 'error', message: 'ID invalid or already taken' }));
//             console.log(`Registration failed for ID: ${data.id}`);
//           } else {
//             users[data.id] = ws;
//             ws.id = data.id;
//             ws.send(JSON.stringify({ type: 'registered', from: 'server', id: data.id }));
//             console.log(`User ${data.id} registered successfully`);
//           }
//           break;

//         case 'offer':
//           console.log(`Offer from ${data.from} to ${data.to}`);
//           if (users[data.to]) {
//             users[data.to].send(JSON.stringify({ type: 'offer', from: data.from, to: data.to, sdp: data.sdp }));
//             console.log(`Offer sent to ${data.to}`);
//           } else {
//             ws.send(JSON.stringify({ type: 'error', from: 'server', message: `User ${data.to} offline` }));
//             console.log(`Offer failed: User ${data.to} is offline`);
//           }
//           break;

//         case 'answer':
//           console.log(`Answer from ${data.from} to ${data.to}`);
//           if (users[data.to]) {
//             users[data.to].send(JSON.stringify({ type: 'answer', from: data.from, to: data.to, sdp: data.sdp }));
//             console.log(`Answer sent to ${data.to}`);
//           } else {
//             console.log(`Answer failed: User ${data.to} is offline`);
//           }
//           break;

//         case 'candidate':
//           console.log(`Candidate from ${data.from} to ${data.to}`);
//           if (users[data.to]) {
//             users[data.to].send(JSON.stringify({ type: 'candidate', from: data.from, to: data.to, candidate: data.candidate }));
//             console.log(`Candidate sent to ${data.to}`);
//           } else {
//             console.log(`Candidate failed: User ${data.to} is offline`);
//           }
//           break;

//         case 'hangup':
//           console.log(`Hangup from ${data.from} to ${data.to}`);
//           if (users[data.to]) {
//             users[data.to].send(JSON.stringify({ type: 'hangup', from: data.from, to: data.to }));
//             console.log(`Hangup sent to ${data.to}`);
//           }
//           break;

//         default:
//           console.log(`Unknown message type received: ${data.type}`);
//       }
//     } catch (err) {
//       console.error('Error parsing message:', err);
//       ws.send(JSON.stringify({ type: 'error', from: 'server', message: 'Invalid message format' }));
//     }
//   });

//   ws.on('close', () => {
//     if (ws.id) {
//       delete users[ws.id];
//       console.log(`User ${ws.id} disconnected`);
//     }
//   });

//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// });




// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: '*' } });

// const users = {};

// io.on('connection', (socket) => {
//   console.log('Socket connected:', socket.id);

//   socket.on('register', (customId) => {
//     if (users[customId] && users[customId].id !== socket.id) {
//       socket.emit('register-error', 'ID already taken');
//       return;
//     }
//     users[customId] = socket;
//     socket.customId = customId;
//     socket.emit('register-success', customId);
//     io.emit('users', Object.keys(users));
//   });

//   socket.on('offer', ({ to, offer }) => {
//     if (users[to]) {
//       console.log(`Sending offer from ${socket.customId} to ${to}`);
//       users[to].emit('offer', { from: socket.customId, offer });
//     }
//   });

//   socket.on('answer', ({ to, answer }) => {
//     if (users[to]) {
//       console.log(`Sending answer from ${socket.customId} to ${to}`);
//       users[to].emit('answer', { from: socket.customId, answer });
//     }
//   });

//   socket.on('candidate', ({ to, candidate }) => {
//     if (users[to]) {
//       console.log(`Sending candidate from ${socket.customId} to ${to}`);
//       users[to].emit('candidate', { from: socket.customId, candidate });
//     }
//   });

//   socket.on('disconnect', () => {
//     if (socket.customId && users[socket.customId]) {
//       delete users[socket.customId];
//       io.emit('users', Object.keys(users));
//     }
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, '0.0.0.0' , () => console.log(`Server running on port ${PORT}`));



const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const users = {};

// Simple logging utility with timestamps
const log = {
  info: (message, data = {}) => console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data),
  error: (message, data = {}) => console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, data),
  debug: (message, data = {}) => console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data),
};

io.on('connection', (socket) => {
  log.info('Socket connected', { socketId: socket.id });

  socket.on('register', (customId) => {
    log.info('Register event received', { customId, socketId: socket.id });
    if (users[customId] && users[customId].id !== socket.id) {
      log.error('Registration failed: ID already taken', { customId });
      socket.emit('register-error', 'ID already taken');
      return;
    }
    users[customId] = socket;
    socket.customId = customId;
    socket.emit('register-success', customId);
    io.emit('users', Object.keys(users));
    log.info('User registered successfully', { customId, socketId: socket.id, activeUsers: Object.keys(users) });
  });

  socket.on('offer', ({ to, offer }) => {
    log.debug('Offer event received', { from: socket.customId, to, offer: JSON.stringify(offer) });
    if (users[to]) {
      log.info('Sending offer', { from: socket.customId, to, offerType: offer.type });
      users[to].emit('offer', { from: socket.customId, offer });
    } else {
      log.error('Target not found for offer', { from: socket.customId, to });
    }
  });

  socket.on('answer', ({ to, answer }) => {
    log.debug('Answer event received', { from: socket.customId, to, answer: JSON.stringify(answer) });
    if (users[to]) {
      log.info('Sending answer', { from: socket.customId, to, answerType: answer.type });
      users[to].emit('answer', { from: socket.customId, answer });
    } else {
      log.error('Target not found for answer', { from: socket.customId, to });
    }
  });

  socket.on('candidate', ({ to, candidate }) => {
    log.debug('Candidate event received', { from: socket.customId, to, candidate: JSON.stringify(candidate) });
    if (users[to]) {
      log.info('Sending ICE candidate', { 
        from: socket.customId, 
        to, 
        candidateType: candidate.type || 'unknown', 
        sdpMid: candidate.sdpMid, 
        sdpMLineIndex: candidate.sdpMLineIndex 
      });
      users[to].emit('candidate', { from: socket.customId, candidate });
    } else {
      log.error('Target not found for candidate', { from: socket.customId, to });
    }
  });

  socket.on('disconnect', () => {
    if (socket.customId && users[socket.customId]) {
      log.info('User disconnected', { customId: socket.customId, socketId: socket.id });
      delete users[socket.customId];
      io.emit('users', Object.keys(users));
      log.debug('Updated user list after disconnect', { activeUsers: Object.keys(users) });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  log.info(`Server running on port ${PORT}`);
});