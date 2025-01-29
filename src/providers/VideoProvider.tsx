import React, { useEffect, useRef, useState, createContext} from 'react';

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureFrame: () => string | null;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const useVideo = (): VideoContextProps => {
    const context = React.useContext(VideoContext);
    if (!context) {
        throw new Error("useVideo must be used within a VideoProvider");
    }
    return context;
}

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((videoStream) => {
        setStream(videoStream);
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      console.error("Video dimensions are not available yet.");
      return null;
    }

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  return (
    <VideoContext.Provider value={{ videoRef, captureFrame }}>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        autoPlay
        playsInline
        onLoadedMetadata={() => {
          if (videoRef.current) {
            videoRef.current.play();
          }
        }}
      />
      {children}
    </VideoContext.Provider>
  );
};