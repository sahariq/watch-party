import React, { useState } from 'react';

export default function RoomLinkGenerator({ meetingId }) {
  const [copied, setCopied] = useState(false);
  const url = `http://localhost:5173/watch?room=${encodeURIComponent(meetingId)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join my Watch Party', url });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return (
    <div style={{ margin: '24px 0', padding: 12, border: '1px solid #eee', borderRadius: 6, maxWidth: 500 }}>
      <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
        Share this link with watchers:
      </label>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={url}
          readOnly
          style={{ flex: 1, marginRight: 8, padding: 6, fontSize: 15 }}
          onFocus={e => e.target.select()}
        />
        <button onClick={handleCopy} style={{ marginRight: 8, padding: '6px 12px' }}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        {navigator.share && (
          <button onClick={handleShare} style={{ padding: '6px 12px' }}>
            Share
          </button>
        )}
      </div>
    </div>
  );
} 