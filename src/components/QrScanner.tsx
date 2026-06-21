import React, { useEffect, useRef } from "react";
import jsQR from "jsqr";

export interface QrScannerProps {
  onDecode?: (result: string | null) => void;
  onError?: (error: Error) => void;
  constraints?: MediaStreamConstraints;
}

const QrScanner: React.FC<QrScannerProps> = ({
  onDecode,
  onError,
  constraints,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints || {
            video: {
              facingMode: { ideal: "environment" },
            },
          }
        );

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = mediaStream;

        const video = videoRef.current;
        if (!video) return;

        video.srcObject = mediaStream;

        video.onloadedmetadata = async () => {
          try {
            await video.play();
            startScanLoop();
          } catch (err) {
            console.warn("Video play interrupted:", err);
          }
        };
      } catch (err) {
        console.error("Camera access error:", err);
        onError?.(err as Error);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [constraints]);

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startScanLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas) return;

      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      const ctx = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const code = jsQR(
        imageData.data,
        imageData.width,
        imageData.height
      );

      if (code) {
        onDecode?.(code.data);
      }
    }, 300);
  };

  return (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="w-full h-full object-cover rounded-xl"
      />

      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};

export default QrScanner;