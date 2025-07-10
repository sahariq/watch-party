import { useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

/**
 * useSocket
 * Connects to ws://localhost:3000, joins a room with role, and provides emit/on helpers.
 * @param {string} roomId - The room to join (Meeting ID)
 * @param {'host'|'watcher'} role - Role of the client in the room
 * @returns {object} { socket, emitSyncCmd, onSyncCmd, emitPing, onPing, emitVideoInfo, onVideoState }
 */
export default function useSocket(roomId, role = 'watcher') {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    const socket = io('ws://localhost:3000', {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[SOCKET] Connected:', socket.id);
      socket.emit('join', { roomId, role });
      console.log('[SOCKET] Joining room:', roomId, 'as', role);
    });

    socket.on('disconnect', () => {
      console.log('[SOCKET] Disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, role]);

  // Safe helper to emit only if socket connected
  const safeEmit = useCallback((event, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
      console.log(`[SOCKET] Emitting ${event}:`, data);
    }
  }, []);

  // Emitters
  const emitSyncCmd = useCallback(cmd => safeEmit('sync-cmd', cmd), [safeEmit]);
  const emitPing = useCallback(ping => safeEmit('ping', ping), [safeEmit]);
  const emitVideoInfo = useCallback(info => safeEmit('video-info', info), [safeEmit]);

  // Listeners
  const onSyncCmd = useCallback((handler) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('sync-cmd', handler);
    return () => {
      if (socketRef.current) socketRef.current.off('sync-cmd', handler);
    };
  }, []);

  const onPing = useCallback((handler) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('ping', handler);
    return () => {
      if (socketRef.current) socketRef.current.off('ping', handler);
    };
  }, []);

  const onVideoState = useCallback((handler) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('video-state', handler);
    return () => {
      if (socketRef.current) socketRef.current.off('video-state', handler);
    };
  }, []);

  return {
    socket: socketRef.current,
    emitSyncCmd,
    onSyncCmd,
    emitPing,
    onPing,
    emitVideoInfo,
    onVideoState,
  };
}