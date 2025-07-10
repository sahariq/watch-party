const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory room state: { [roomId]: { videoId, time, isPlaying, hostSocketId } }
const roomStates = {};

io.on('connection', (socket) => {
  console.log('[SOCKET] New client connected:', socket.id);

  let joinedRoom = null;
  let isHost = false;

  // Handle joining a room
  socket.on('join-room', ({ roomId, host }) => {
    if (!roomId) return;

    joinedRoom = roomId;
    isHost = !!host;
    socket.join(roomId);

    console.log(`[SOCKET] ${socket.id} joined room ${roomId} as ${isHost ? 'host' : 'watcher'}`);

    // Watcher receives current state
    if (!isHost && roomStates[roomId]) {
      socket.emit('video-state', roomStates[roomId]);
      console.log(`[SOCKET] Sent current video state to watcher ${socket.id} in room ${roomId}`);
    }
  });

  // Host sends updates
  socket.on('host-state', ({ roomId, videoId, time, isPlaying }) => {
    if (!roomId) return;

    roomStates[roomId] = {
      videoId,
      time,
      isPlaying,
      hostSocketId: socket.id,
    };

    socket.to(roomId).emit('video-state', roomStates[roomId]);
    console.log(`[SOCKET] Host ${socket.id} updated state for room ${roomId}:`, roomStates[roomId]);
  });

  // Relay sync commands
  socket.on('sync-cmd', (data) => {
    if (!joinedRoom) return;
    socket.to(joinedRoom).emit('sync-cmd', data);
    console.log(`[SOCKET] Relayed sync-cmd in room ${joinedRoom}:`, data);
  });

  // Relay ping events
  socket.on('ping', (data) => {
    if (!joinedRoom) return;
    socket.to(joinedRoom).emit('ping', data);
    console.log(`[SOCKET] Relayed ping in room ${joinedRoom}:`, data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (joinedRoom && isHost) {
      delete roomStates[joinedRoom];
      io.in(joinedRoom).emit('host-disconnected');
      console.log(`[SOCKET] Host ${socket.id} disconnected, cleared state for room ${joinedRoom}`);
    } else if (joinedRoom) {
      console.log(`[SOCKET] Watcher ${socket.id} disconnected from room ${joinedRoom}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Socket.io server running on http://localhost:${PORT}`);
});
