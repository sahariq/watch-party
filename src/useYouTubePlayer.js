import { useEffect, useRef } from 'react';

/**
 * useYouTubePlayer
 * Loads the YouTube IFrame API dynamically and initializes a YouTube player inside a container.
 * @param {string} videoId - The YouTube video ID to load.
 * @param {object} [options] - Additional player options. Supports 'forcePlayOnPause' to prevent pausing.
 * @returns {[containerRef, playerRef]} - A ref for the container and the player instance.
 */
export default function useYouTubePlayer(videoId, options = {}) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Abort if no videoId yet
    if (!videoId) return;

    let playerReady = false;
    let ytPlayer = null;
    const forcePlayOnPause = options.forcePlayOnPause;

    // Initialize YouTube Player
    function initializePlayer() {
      if (!containerRef.current) return;

      ytPlayer = new window.YT.Player(containerRef.current, {
        height: '390',
        width: '640',
        videoId,
        events: {
          onReady: () => {
            playerReady = true;
            console.log('[YT] Player ready');
          },
          onError: (e) => {
            console.error('[YT] Player error:', e);
          },
          onStateChange: (e) => {
            // Prevent pausing if forcePlayOnPause is set
            if (forcePlayOnPause && e.data === window.YT.PlayerState.PAUSED) {
              if (ytPlayer && ytPlayer.playVideo) {
                ytPlayer.playVideo();
              }
            }
            if (options.events && typeof options.events.onStateChange === 'function') {
              options.events.onStateChange(e);
            }
          },
        },
        ...options,
      });
      playerRef.current = ytPlayer;
    }

    // Load YT API if not already loaded
    if (!window.YT || !window.YT.Player) {
      window.onYouTubeIframeAPIReady = initializePlayer;

      const existing = document.getElementById('youtube-iframe-api');
      if (!existing) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    } else {
      initializePlayer();
    }

    // Cleanup
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return [containerRef, playerRef];
}
