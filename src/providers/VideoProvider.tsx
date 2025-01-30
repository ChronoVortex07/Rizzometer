import React, { useEffect, useRef, useState, createContext } from "react";

interface VideoContextProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureFrame: () => string | null;
  toggleVideoSource: (fileUrl?: string) => void;
  setUseVideoFile: (useVideoFile: boolean) => void;
  useVideoFile: boolean;
}

const VideoContext = createContext<VideoContextProps | undefined>(undefined);

export const useVideo = (): VideoContextProps => {
  const context = React.useContext(VideoContext);
  if (!context) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useVideoFile, setUseVideoFile] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    if (useVideoFile) {
      // Stop webcam if switching to video file
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = videoSrc || "";
      }
    } else {
      // Start webcam if switching back
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((videoStream) => {
          setStream(videoStream);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
          }
        })
        .catch((err) => console.error("Error accessing webcam:", err));
    }

    return () => {
      if (!useVideoFile) {
        stream?.getTracks().forEach((track) => track.stop());
      }
    };
  }, [useVideoFile, videoSrc]);

  const toggleVideoSource = (fileUrl?: string) => {
    if (fileUrl) {
      setVideoSrc(fileUrl);
      setUseVideoFile(true);
    } else {
      setUseVideoFile(false);
      setVideoSrc(null);
    }
  };

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
    <VideoContext.Provider value={{ videoRef, captureFrame, toggleVideoSource, setUseVideoFile, useVideoFile }}>
      <video
        ref={videoRef}
        style={{ display: "none" }}
        autoPlay
        playsInline
        controls={useVideoFile} // Show controls if using a video file
      />
      {children}
    </VideoContext.Provider>
  );
};
