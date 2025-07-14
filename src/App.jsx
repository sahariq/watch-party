import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useYouTubePlayer from './useYouTubePlayer';
import useSocket from './useSocket';
import RoomLinkGenerator from './RoomLinkGenerator';
import './index.css';
import logo from './assets/logo.png';
import timeIcon from './assets/time.png';
import phoneIcon from './assets/cell-phone.png';
import userIcon from './assets/user.png';
import copyIcon from './assets/copy.png';
import playIcon from './assets/play-button.png';

function LandingPage() {
  const fullText = 'Watch Together. Anywhere.';
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero">
      <div className="hero-title">
        {displayed}
        <span
          style={{
            display: 'inline-block',
            width: '1ch',
            background: 'currentColor',
            height: '1.1em',
            marginLeft: 2,
            animation: 'blink 1s steps(1) infinite',
            verticalAlign: 'middle',
          }}
        ></span>
      </div>
      <div className="hero-subtitle subheading">
        Watch, chat, and connect—together, from anywhere.
      </div>
      <div className="button-row">
        <Link to="/host"><button className="button-primary">Start Watch Party</button></Link>
        <Link to="/watch"><button className="button-secondary">Join Party</button></Link>
      </div>
      <div className="feature-list">
        <div className="feature-card">
          <img src={timeIcon} alt="Sync Playback" className="feature-icon" style={{ height: 44, width: 44, marginBottom: 8 }} />
          <div className="feature-label" style={{ color: '#000' }}>Sync Playback</div>
          <div className="feature-desc" style={{ color: '#222' }}>Everyone stays in perfect sync</div>
        </div>
        <div className="feature-card">
          <img src={phoneIcon} alt="Mobile Friendly" className="feature-icon" style={{ height: 44, width: 44, marginBottom: 8 }} />
          <div className="feature-label" style={{ color: '#000' }}>Mobile Friendly</div>
          <div className="feature-desc" style={{ color: '#222' }}>Works beautifully on any device</div>
        </div>
      </div>
    </div>
  );
}

function generateMeetingId() {
  // 8-digit alphanumeric
  return Math.random().toString(36).substr(2, 8).toUpperCase();
}

function HostPage() {
  const [meetingId] = useState(generateMeetingId());
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
  const [copied, setCopied] = useState(false);

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
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [meetingId, playerRef, emitPing]);

  // Copy to clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '5rem 1rem' }}>
      <div className="host-dashboard-card">
        <div className="host-dashboard-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div id="ransomizer-wtsjt9m7" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 50 }}>
            <div className="ts">
              <div className="tw">
                <div data-text="H" className="mlvx-0 tc"><div data-text="H">H</div></div>
                <div data-text="o" className="mlvx-1 tc"><div data-text="o">o</div></div>
                <div data-text="s" className="mlvx-2 tc"><div data-text="s">s</div></div>
                <div data-text="t" className="mlvx-3 tc"><div data-text="t">t</div></div>
              </div>
              <div className="tw">
                <div data-text="D" className="mlvx-5 tc"><div data-text="D">D</div></div>
                <div data-text="a" className="mlvx-6 tc"><div data-text="a">a</div></div>
                <div data-text="s" className="mlvx-7 tc"><div data-text="s">s</div></div>
                <div data-text="h" className="mlvx-8 tc"><div data-text="h">h</div></div>
                <div data-text="b" className="mlvx-9 tc"><div data-text="b">b</div></div>
                <div data-text="o" className="mlvx-10 tc"><div data-text="o">o</div></div>
                <div data-text="a" className="mlvx-11 tc"><div data-text="a">a</div></div>
                <div data-text="r" className="mlvx-12 tc"><div data-text="r">r</div></div>
                <div data-text="d" className="mlvx-13 tc"><div data-text="d">d</div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="pill-badge">
          <span className="live-dot"></span>
          Room Status: Live
        </div>
        <div className="section-divider"></div>
        <div className="room-code-label">Room Code</div>
        <div className="room-code-row">
          <span className="room-code-box" tabIndex={0}>{meetingId}</span>
          <button className="copy-id-btn" onClick={handleCopy}>
            <img src={copyIcon} alt="Copy" style={{ height: 18, width: 18, marginRight: 6 }} /> Copy ID
          </button>
          {copied && <span style={{ color: 'var(--color-success)', marginLeft: 8, fontWeight: 500 }}>Copied!</span>}
        </div>
        <div className="section-divider"></div>
        <form onSubmit={handleVideoInputSubmit}>
          <div className="video-input-label">Enter a YouTube video link:</div>
          <div className="video-input-row">
            <input
              type="text"
              value={videoInput}
              onChange={e => setVideoInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="video-input-field"
            />
            <button className="load-video-btn" type="submit">
              <img src={playIcon} alt="Load" style={{ height: 20, width: 20, marginRight: 6 }} /> Load Video
            </button>
          </div>
          {status && (
            <div style={{ color: (status === 'Player ready. Use controls to start playback.' || status === 'Ready') ? '#222' : 'var(--color-success)', marginTop: 8 }}>
              {status}
            </div>
          )}
        </form>
      </div>
      {videoId && (
        <div className="glass-card" style={{ margin: '0 auto', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Now Playing</div>
          <div ref={containerRef} id="player" style={{ width: 640, height: 390, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(127,90,240,0.18)' }} />
          <div style={{marginTop: 8, color: 'var(--color-text-muted)' }}>Video ID: <code>{videoId}</code></div>
          <div style={{marginTop: 8, color: '#0074D9'}}>{status}</div>
        </div>
      )}
    </div>
  );
}

function WatchPage() {
  const [meetingIdInput, setMeetingIdInput] = useState('');
  const [room, setRoom] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [status, setStatus] = useState('Waiting for host to start...');
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false); // Overlay state
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

  // Handler for Meeting ID form submit
  function handleMeetingIdSubmit(e) {
    e.preventDefault();
    if (meetingIdInput.trim()) {
      setRoom(meetingIdInput.trim());
    }
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
    const cleanup = onSyncCmd(async (cmd) => {
      if (!playerRef.current) return;
      if (typeof cmd.time === 'number') {
        playerRef.current.seekTo(cmd.time, true);
      }
      if (cmd.type === 'play') {
        try {
          await playerRef.current.playVideo();
          setShowOverlay(false);
        } catch (e) {
          setShowOverlay(true); // Show overlay if autoplay fails
        }
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
      // Always correct drift, not just if > 0.3s
      playerRef.current.seekTo(ping.time, true);
      setStatus('Auto-corrected drift');
    });
    return cleanup;
  }, [onPing, playerRef, videoId]);

  useEffect(() => {
    if (!socket) return;
    const handleHostDisconnected = () => {
      setStatus('The host has left the party. Playback will not be synchronized until the host returns.');
      if (playerRef.current) {
        playerRef.current.pauseVideo();
      }
    };
    socket.on('host-disconnected', handleHostDisconnected);
    return () => {
      socket.off('host-disconnected', handleHostDisconnected);
    };
  }, [socket, playerRef]);

  // Handler for overlay click
  const handleOverlayClick = async () => {
    if (playerRef.current) {
      await playerRef.current.playVideo();
      setShowOverlay(false);
    }
  };

  if (!room) {
    return (
      <div style={{ maxWidth: 400, margin: '48px auto', padding: 24, border: '1px solid #eee', borderRadius: 8, background: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 16 }}>Join a Watch Party</div>
        <form onSubmit={handleMeetingIdSubmit}>
          <label style={{ fontWeight: 500, fontSize: 16 }}>Enter Meeting ID:</label>
          <input
            type="text"
            value={meetingIdInput}
            onChange={e => setMeetingIdInput(e.target.value)}
            placeholder="e.g. party123"
            style={{ margin: '16px 0', width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button className="accent-gradient" type="submit" style={{ width: '100%' }}>Join</button>
        </form>
        <div style={{ color: 'var(--color-error)', marginTop: 16 }}>
          Missing or invalid room parameter. Please enter your Meeting ID.
        </div>
      </div>
    );
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
      <div className="glass-card" style={{ margin: '0 auto', maxWidth: 700, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 420, justifyContent: 'center', position: 'relative' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Now Playing</div>
        <div ref={containerRef} id="player" style={{ width: 640, height: 390, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 32px 0 rgba(127,90,240,0.18)', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {!videoId && <span style={{ color: '#fff' }}>Waiting for host to start the video...</span>}
          {showOverlay && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              flexDirection: 'column',
            }}>
              <button onClick={handleOverlayClick} style={{
                padding: '18px 36px',
                fontSize: 22,
                borderRadius: 12,
                border: 'none',
                background: 'var(--color-accent)',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 12px 0 rgba(127,90,240,0.18)'
              }}>
                Click to Start Watching
              </button>
              <div style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Your browser blocked autoplay. Click to start the video.</div>
            </div>
          )}
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
      <nav style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        marginBottom: 20,
        background: '#2b2d42',
        padding: '0.5rem 0',
        boxShadow: '0 4px 24px 0 rgba(30,30,40,0.18)',
        borderRadius: 32,
        width: 'calc(100% - 48px)',
        maxWidth: 900,
        border: '2px solid #8d99ae',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
          <Link to="/" className="navbar-btn navbar-btn-home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', border: 'none', background: 'transparent', padding: 0 }}>
            <img src={logo} alt="PlayPal logo" style={{ height: 38, marginRight: 0, verticalAlign: 'middle' }} />
          </Link>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link to="/host" className="navbar-btn navbar-btn-host">Host</Link>
            <Link to="/watch" className="navbar-btn navbar-btn-watch">Watch</Link>
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