/**
 * HLS live player using hls.js.
 * Falls back to native HLS (Safari) when hls.js is not supported.
 */
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useCameraStore } from '@/store/cameraStore';

interface Props {
  cameraId: string;
  onClose:  () => void;
}

export const CameraPlayer = ({ cameraId, onClose }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef   = useRef<Hls | null>(null);
  const { cameras, streamUrls, startStream, stopStream } = useCameraStore();
  const camera = cameras.find((c) => c.id === cameraId);

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [hlsUrl,  setHlsUrl]  = useState<string | null>(streamUrls[cameraId] ?? null);

  // Start stream on mount
  useEffect(() => {
    if (hlsUrl) return; // already started
    startStream(cameraId)
      .then((url) => setHlsUrl(url))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Stream error'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  // Attach hls.js once URL is known
  useEffect(() => {
    if (!hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        void video.play().catch(() => undefined);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError(`HLS error: ${data.type}`);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        void video.play().catch(() => undefined);
      });
    } else {
      setError('HLS not supported in this browser');
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [hlsUrl]);

  const handleClose = () => {
    hlsRef.current?.destroy();
    stopStream(cameraId).catch(() => undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
      {/* Header */}
      <div className="mb-3 flex w-full max-w-4xl items-center justify-between">
        <h2 className="font-semibold text-white">{camera?.name ?? cameraId}</h2>
        <button
          onClick={handleClose}
          className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 hover:bg-white/10"
        >
          ✕ Close
        </button>
      </div>

      {/* Video */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-xl bg-black">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-gray-400">Connecting to stream…</span>
          </div>
        )}
        {error && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full"
          controls
          playsInline
          muted
          style={{ display: error ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};
