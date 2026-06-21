'use client';

import { useEffect } from 'react';

function parsePlayerMessage(data: unknown): { event?: string; info?: number } | null {
  try {
    if (typeof data === 'string') return JSON.parse(data);
    return data && typeof data === 'object' ? data as { event?: string; info?: number } : null;
  } catch {
    return null;
  }
}

export function ExclusiveMediaPlayback() {
  useEffect(() => {
    const pauseOtherNativeMedia = (current?: HTMLMediaElement) => {
      document.querySelectorAll<HTMLMediaElement>('video, audio').forEach(media => {
        if (media !== current && !media.paused) media.pause();
      });
    };
    const pauseYoutubeFrames = (currentWindow?: Window | null) => {
      document.querySelectorAll<HTMLIFrameElement>('iframe[data-exclusive-media="youtube"]').forEach(frame => {
        if (frame.contentWindow !== currentWindow) {
          frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        }
      });
    };

    const onPlay = (event: Event) => {
      const current = event.target instanceof HTMLMediaElement ? event.target : undefined;
      pauseOtherNativeMedia(current);
      pauseYoutubeFrames();
    };
    const onMessage = (event: MessageEvent) => {
      const message = parsePlayerMessage(event.data);
      if (message?.event === 'onStateChange' && message.info === 1) {
        pauseOtherNativeMedia();
        pauseYoutubeFrames(event.source as Window | null);
      }
    };

    document.addEventListener('play', onPlay, true);
    window.addEventListener('message', onMessage);
    return () => {
      document.removeEventListener('play', onPlay, true);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}