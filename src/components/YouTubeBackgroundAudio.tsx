import React, { useEffect, useRef } from 'react';

interface YouTubeBackgroundAudioProps {
  isMirmanuBoss?: boolean;
}

export const YouTubeBackgroundAudio: React.FC<YouTubeBackgroundAudioProps> = ({
  isMirmanuBoss = false,
}) => {
  const mainIframeRef = useRef<HTMLIFrameElement | null>(null);
  const bossIframeRef = useRef<HTMLIFrameElement | null>(null);
  const volumeDropTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInteractedRef = useRef<boolean>(false);

  // Main track: Demokratik Kongo Cumhuriyeti
  const mainVideoId = 'lFFpzBs_GTA';
  // Secondary boss theme track: (Q2W2TeUUYps)
  const bossVideoId = 'Q2W2TeUUYps';

  // Handle user interaction to unlock browser audio autoplay
  useEffect(() => {
    const handleFirstInteraction = () => {
      hasInteractedRef.current = true;
      if (mainIframeRef.current && mainIframeRef.current.contentWindow) {
        mainIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
      }

      // If user is already on Mirmanu on first click
      if (isMirmanuBoss && bossIframeRef.current && bossIframeRef.current.contentWindow) {
        bossIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
        bossIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
          '*'
        );
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isMirmanuBoss]);

  // Handle Mirmanu Boss Music: Only plays on Mirmanu, starts with 100% full bass volume, then drops to background level
  useEffect(() => {
    if (volumeDropTimerRef.current) {
      clearTimeout(volumeDropTimerRef.current);
    }

    const bossWindow = bossIframeRef.current?.contentWindow;
    if (!bossWindow) return;

    if (isMirmanuBoss) {
      // 1. Start boss track immediately at 100% volume
      bossWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
      bossWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }),
        '*'
      );

      // 2. After 3.5 seconds of high-energy bass blast, smoothly drop volume to background level (28%)
      volumeDropTimerRef.current = setTimeout(() => {
        bossWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'setVolume', args: [55] }),
          '*'
        );
        setTimeout(() => {
          bossWindow.postMessage(
            JSON.stringify({ event: 'command', func: 'setVolume', args: [28] }),
            '*'
          );
        }, 800);
      }, 3500);
    } else {
      // Pause and mute boss music completely outside of Mirmanu
      bossWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      );
      bossWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
        '*'
      );
    }

    return () => {
      if (volumeDropTimerRef.current) {
        clearTimeout(volumeDropTimerRef.current);
      }
    };
  }, [isMirmanuBoss]);

  return (
    <div
      id="hidden-dual-youtube-background-audio"
      className="fixed -top-[9999px] -left-[9999px] w-1 h-1 pointer-events-none opacity-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Main Background Music: Demokratik Kongo (Continuous) */}
      <iframe
        ref={mainIframeRef}
        title="Main Background Audio"
        width="100"
        height="100"
        src={`https://www.youtube-nocookie.com/embed/${mainVideoId}?autoplay=1&loop=1&playlist=${mainVideoId}&enablejsapi=1&playsinline=1&controls=0&origin=${
          typeof window !== 'undefined' ? window.location.origin : ''
        }`}
        allow="autoplay; encrypted-media"
      />

      {/* 2. Mirmanu Final Boss Track (Only plays on Mirmanu with initial bass blast then drops) */}
      <iframe
        ref={bossIframeRef}
        title="Mirmanu Boss Layer Audio"
        width="100"
        height="100"
        src={`https://www.youtube-nocookie.com/embed/${bossVideoId}?autoplay=0&loop=1&playlist=${bossVideoId}&enablejsapi=1&playsinline=1&controls=0&origin=${
          typeof window !== 'undefined' ? window.location.origin : ''
        }`}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
};
