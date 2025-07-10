import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useYouTubePlayer from './useYouTubePlayer';
import useSocket from './useSocket';
import RoomLinkGenerator from './RoomLinkGenerator';
import './index.css';

function LandingPage() {
  return (
    <div className="hero">
      <div className="hero-title">Watch Together. Anywhere.</div>
      <div className="hero-subtitle">Host a synchronized watch party with friends, family, or your community. Enjoy a premium, cinematic experience—no matter where you are.</div>
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <Link to="/host"><button className="accent-gradient">Start Watch Party</button></Link>
        <Link to="/watch"><button className="accent-gradient" style={{ background: 'var(--color-accent2)', color: '#fff' }}>Join Party</button></Link>
      </div>
      <div className="feature-list">
        <div className="feature-card">
          <span role="img" aria-label="sync" style={{ fontSize: 32 }}>⏱️</span>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Sync Playback</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Everyone stays in perfect sync</div>
        </div>
        <div className="feature-card">
          <span role="img" aria-label="chat" style={{ fontSize: 32 }}>💬</span>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Real-Time Chat</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Chat and react live with friends</div>
        </div>
        <div className="feature-card">
          <span role="img" aria-label="emoji" style={{ fontSize: 32 }}>🎉</span>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Emoji Reactions</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Express yourself with floating emojis</div>
        </div>
        <div className="feature-card">
          <span role="img" aria-label="mobile" style={{ fontSize: 32 }}>📱</span>
          <div style={{ fontWeight: 600, marginTop: 8 }}>Mobile Friendly</div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Works beautifully on any device</div>
        </div>
      </div>
    </div>
  );
}

function HostPage() {
  const [meetingId, setMeetingId] = useState('');
  const [meetingIdInput, setMeetingIdInput] = useState('');
  const [meetingIdError, setMeetingIdError] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [status, setStatus] = useState('');
  const { emitSyncCmd, emitPing, emitVideoInfo, socket } = useSocket(meetingId, 'host');
  const [containerRef, playerRef] = useYouTubePlayer(videoId, {
    playerVars: {
      controls: 1,
      disablekb: 0,
      modestbranding: 1,
      rel: 0,
      fs: 1,
      iv_load_policy: 3,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  useEffect(() => {
    if (socket && meetingId) {
      console.log('[HOST] Joined room:', meetingId);
    }
  }, [socket, meetingId]);

  useEffect(() => {
    if (socket && meetingId && videoId && emitVideoInfo) {
      console.log('[HOST] Emitting video-info:', { videoId, roomId: meetingId });
      emitVideoInfo({ videoId, roomId: meetingId });
    }
  }, [socket, meetingId, videoId, emitVideoInfo]);

  function handleMeetingIdSubmit(e) {
    e.preventDefault();
    if (!meetingIdInput.trim()) {
      setMeetingIdError('Meeting ID cannot be empty.');
      return;
    }
    setMeetingId(meetingIdInput.trim());
    setMeetingIdError('');
  }

  function handleVideoInputSubmit(e) {
    e.preventDefault();
    const id = extractYouTubeVideoId(videoInput);
    if (id) {
      setVideoId(id);
      setStatus('Ready');
    } else {
      setStatus('Please enter a valid YouTube link.');
    }
  }

  function onPlayerReady(event) {
    setStatus('Player ready. Use controls to start playback.');
  }

  function onPlayerStateChange(event) {
    if (!playerRef.current || !emitSyncCmd) return;
    const YT = window.YT;
    const currentTime = playerRef.current.getCurrentTime();
    if (event.data === YT.PlayerState.PLAYING) {
      emitSyncCmd({ type: 'play', time: currentTime, roomId: meetingId });
      setStatus('Playing');
      console.log('[HOST] Emitting sync-cmd: play', { time: currentTime, roomId: meetingId });
    } else if (event.data === YT.PlayerState.PAUSED) {
      emitSyncCmd({ type: 'pause', time: currentTime, roomId: meetingId });
      setStatus('Paused');
      console.log('[HOST] Emitting sync-cmd: pause', { time: currentTime, roomId: meetingId });
    }
  }

  useEffect(() => {
    if (!meetingId || !playerRef.current || !emitPing) return;
    const interval = setInterval(() => {
      if (playerRef.current) {
        emitPing({ time: playerRef.current.getCurrentTime(), roomId: meetingId });
        // console.log('[HOST] Emitting ping:', { time: playerRef.current.getCurrentTime(), roomId: meetingId });
      }
    }, 1000); // 1 second for tighter sync
    return () => clearInterval(interval);
  }, [meetingId, playerRef, emitPing]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="glass-card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>Host Dashboard</div>
          <div style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 16 }}>
            Room Status: <span style={{ color: '#2ec4b6' }}>{meetingId ? 'Live' : 'Not started'}</span>
          </div>
        </div>
        <div style={{ marginTop: 12, color: 'var(--color-text-muted)' }}>
          {meetingId ? `Room Code: ${meetingId}` : 'Set a room code to start your party.'}
        </div>
      </div>
      {!meetingId ? (
        <form onSubmit={handleMeetingIdSubmit} className="glass-card" style={{ maxWidth: 400, margin: '0 auto' }}>
          <label style={{ fontWeight: 600, fontSize: 18 }}>Enter Meeting ID:</label>
          <input
            type="text"
            value={meetingIdInput}
            onChange={e => setMeetingIdInput(e.target.value)}
            placeholder="e.g. party123"
            style={{ margin: '16px 0', width: '100%', padding: '0.7rem', borderRadius: 8, border: 'none', fontSize: 16 }}
          />
          <button className="accent-gradient" type="submit" style={{ width: '100%' }}>Set Meeting ID</button>
          {meetingIdError && <div style={{ color: 'var(--color-error)', marginTop: 8 }}>{meetingIdError}</div>}
        </form>
      ) : (
        <>
          <RoomLinkGenerator meetingId={meetingId} />
          <form onSubmit={handleVideoInputSubmit} className="glass-card" style={{ maxWidth: 500, margin: '0 auto', marginBottom: 32 }}>
            <label style={{ fontWeight: 600, fontSize: 18 }}>Enter a YouTube video link:</label>
            <input
              type="text"
              value={videoInput}
              onChange={e => setVideoInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              style={{ margin: '16px 0', width: '100%', padding: '0.7rem', borderRadius: 8, border: 'none', fontSize: 16 }}
            />
            <button className="accent-gradient" type="submit" style={{ width: '100%' }}>Load Video</button>
            {status && <div style={{ color: 'var(--color-success)', marginTop: 8 }}>{status}</div>}
          </form>
          {videoId && (
            <div className="glass-card" style={{ margin: '0 auto', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Now Playing</div>
              <div ref={containerRef} id="player" style={{ width: 640, height: 390, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(127,90,240,0.18)' }} />
              <div style={{marginTop: 8, color: 'var(--color-text-muted)' }}>Video ID: <code>{videoId}</code></div>
              <div style={{marginTop: 8, color: '#0074D9'}}>{status}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function useRoomQuery() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get('room');
}

function WatchPage() {
  const room = useRoomQuery();
  const [videoId, setVideoId] = useState(null);
  const [status, setStatus] = useState('Waiting for host to start...');
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const { onSyncCmd, onPing, onVideoState, socket } = useSocket(room, 'watcher');
  const [containerRef, playerRef] = useYouTubePlayer(videoId, videoId ? {
    playerVars: {
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
      fs: 0,
      iv_load_policy: 3,
    },
    events: {
      onReady: onPlayerReady,
    },
    forcePlayOnPause: true,
  } : undefined);

  function onPlayerReady(event) {
    setStatus('Player ready. Waiting for host to start playback...');
  }

  useEffect(() => {
    if (socket && room) {
      console.log('[WATCH] Joined room:', room);
    }
  }, [socket, room]);

  useEffect(() => {
    if (!room || !onVideoState) return;
    setStatus('Waiting for host to start...');
    setError('');
    setVideoId(null);
    setJoined(false);
    const cleanup = onVideoState((state) => {
      console.log('[WATCH] Received video-state:', state);
      if (state && state.videoId) {
        setVideoId(state.videoId);
        setStatus('Video loaded. Waiting for host to start playback...');
        setJoined(true);
      } else {
        setError('Host has not set a video yet.');
      }
    });
    return cleanup;
  }, [room, onVideoState]);

  useEffect(() => {
    if (!videoId || !onSyncCmd) return;
    const cleanup = onSyncCmd((cmd) => {
      if (!playerRef.current) return;
      if (typeof cmd.time === 'number') {
        playerRef.current.seekTo(cmd.time, true);
      }
      if (cmd.type === 'play') {
        playerRef.current.playVideo();
        setStatus('Playing');
        setHasStarted(true);
      } else if (cmd.type === 'pause') {
        playerRef.current.pauseVideo();
        setStatus('Paused');
      } else if (cmd.type === 'seek') {
        setStatus('Seeked');
      }
    });
    return cleanup;
  }, [onSyncCmd, playerRef, videoId]);

  useEffect(() => {
    if (!videoId || !onPing) return;
    const cleanup = onPing((ping) => {
      if (!playerRef.current) return;
      const localTime = playerRef.current.getCurrentTime();
      if (Math.abs(localTime - ping.time) > 0.3) {
        playerRef.current.seekTo(ping.time, true);
        setStatus('Auto-corrected drift');
      }
    });
    return cleanup;
  }, [onPing, playerRef, videoId]);

  if (!room) {
    return <div style={{ color: 'var(--color-error)', marginTop: 32, textAlign: 'center' }}>Missing or invalid room parameter. Please check your link or ask the host for the correct Meeting ID.</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="glass-card" style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 22 }}>Watch Party</div>
        <div style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: 16, marginTop: 8 }}>
          Room: <span style={{ color: '#2ec4b6' }}>{room}</span>
        </div>
        {error && <div style={{ color: 'var(--color-error)', marginTop: 16 }}>{error}</div>}
      </div>
      <div className="glass-card" style={{ margin: '0 auto', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 420, justifyContent: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Now Playing</div>
        <div ref={containerRef} id="player" style={{ width: 640, height: 390, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(127,90,240,0.18)', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!videoId && <span style={{ color: '#fff' }}>Waiting for host to start the video...</span>}
        </div>
        {videoId && <div style={{marginTop: 8, color: 'var(--color-text-muted)' }}>Video ID: <code>{videoId}</code></div>}
        <div style={{marginTop: 8, color: '#0074D9'}}>{status}</div>
      </div>
    </div>
  );
}

function extractYouTubeVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function App() {
  return (
    <Router>
      <nav style={{ marginBottom: 20, background: 'rgba(30,30,40,0.7)', padding: '1rem 0', boxShadow: '0 2px 12px 0 rgba(127,90,240,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ fontWeight: 800, fontSize: 24, color: 'var(--color-accent)', textDecoration: 'none', letterSpacing: '-1px' }}>WatchParty</Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link to="/host" className="accent-gradient" style={{ fontSize: 16, padding: '0.5rem 1.2rem' }}>Host</Link>
            <Link to="/watch" className="accent-gradient" style={{ fontSize: 16, padding: '0.5rem 1.2rem', background: 'var(--color-accent2)' }}>Watch</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/watch" element={<WatchPage />} />
        <Route path="*" element={<div style={{ textAlign: 'center', marginTop: 80 }}><h2>Welcome to Watch Party!</h2><p>Select Host or Watch to begin.</p></div>} />
      </Routes>
    </Router>
  );
}

export default App;