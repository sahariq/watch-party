import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Room states: { roomId: { videoId, time, isPlaying, hostSocketId } }
const roomStates = {};
const knownEvents = ['join', 'video-info', 'sync-cmd', 'ping', 'disconnect', 'error'];

io.on('connection', (socket) => {
  console.log(`[CONNECT] Client connected: ${socket.id}`);

  let joinedRoom = null;
  let isHost = false;

  // Changed from 'join-room' to 'join' to match client
  socket.on('join', ({ roomId, role }) => {
    if (!roomId) {
      socket.emit('error', { message: 'Missing roomId. Cannot join room.' });
      console.warn(`[ERROR] ${socket.id} tried to join without roomId.`);
      return;
    }

    joinedRoom = roomId;
    isHost = role === 'host';
    socket.join(roomId);

    console.log(`[JOIN] ${socket.id} joined room ${roomId} as ${isHost ? 'host' : 'watcher'}`);

    // Send current video state to new watchers
    if (!isHost && roomStates[roomId]) {
      socket.emit('video-state', roomStates[roomId]);
      console.log(`[SYNC] Sent current video state to ${socket.id} in room ${roomId}`);
    }
  });

  // Changed from 'host-state' to 'video-info' to match client
  socket.on('video-info', ({ roomId, videoId }) => {
    if (!roomId) {
      socket.emit('error', { message: 'Missing roomId in video-info.' });
      console.warn(`[ERROR] Host ${socket.id} sent video-info without roomId.`);
      return;
    }

    if (!isHost) {
      console.warn(`[WARN] Non-host ${socket.id} attempted to send video-info`);
      return;
    }

    // Initialize or update room state
    roomStates[roomId] = {
      videoId,
      time: 0,
      isPlaying: false,
      hostSocketId: socket.id,
    };

    // Broadcast video state to all watchers in the room
    socket.to(roomId).emit('video-state', roomStates[roomId]);
    console.log(`[VIDEO-INFO] ${socket.id} updated room ${roomId}`, roomStates[roomId]);
  });

  socket.on('sync-cmd', (data) => {
    if (!joinedRoom) {
      socket.emit('error', { message: 'You must join a room before sending sync-cmd.' });
      return;
    }

    if (!isHost) {
      console.warn(`[WARN] Watcher ${socket.id} attempted to send sync-cmd`);
      return;
    }

    // Update room state based on sync command
    if (roomStates[joinedRoom]) {
      roomStates[joinedRoom].time = data.time || 0;
      roomStates[joinedRoom].isPlaying = data.type === 'play';
    }

    // Broadcast sync command to all watchers in the room
    socket.to(joinedRoom).emit('sync-cmd', data);
    console.log(`[SYNC-CMD] ${socket.id} broadcasted to room ${joinedRoom}:`, data);
  });

  socket.on('ping', (data) => {
    if (!joinedRoom) {
      socket.emit('error', { message: 'You must join a room before sending ping.' });
      return;
    }

    if (!isHost) {
      console.warn(`[WARN] Watcher ${socket.id} attempted to send ping`);
      return;
    }

    // Update room state time
    if (roomStates[joinedRoom]) {
      roomStates[joinedRoom].time = data.time || 0;
    }

    // Broadcast ping to all watchers in the room
    socket.to(joinedRoom).emit('ping', data);
    console.log(`[PING] ${socket.id} broadcasted ping to room ${joinedRoom}`, data);
  });

  socket.on('disconnect', () => {
    if (joinedRoom && isHost) {
      delete roomStates[joinedRoom];
      io.to(joinedRoom).emit('host-disconnected');
      console.log(`[DISCONNECT] Host ${socket.id} left room ${joinedRoom}, state cleared.`);
    } else if (joinedRoom) {
      console.log(`[DISCONNECT] Watcher ${socket.id} left room ${joinedRoom}`);
    } else {
      console.log(`[DISCONNECT] Client ${socket.id} disconnected (no room)`);
    }
  });

  socket.on('error', (err) => {
    console.error(`[SOCKET ERROR] ${socket.id}:`, err);
  });

  socket.onAny((event, ...args) => {
    if (!knownEvents.includes(event)) {
      console.warn(`[UNKNOWN EVENT] ${socket.id} sent '${event}'`, args);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.io server running at http://localhost:${PORT}`);
});