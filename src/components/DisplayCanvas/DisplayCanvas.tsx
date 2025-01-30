import "./DisplayCanvas.css";
import React, { useEffect, useState } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { useVideo } from "../../providers/VideoProvider";

const VideoDisplay: React.FC = () => {
  const { videoRef } = useVideo();
  const { socket } = useSocket();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  // Update the displayed size when the video resizes
  useEffect(() => {
    const updateSize = () => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        console.log(rect.width, rect.height);
        setVideoSize({ width: rect.width, height: rect.height });
      }
    };
    // Update on video load
    videoRef.current?.addEventListener("loadeddata", updateSize);

    // Update on window resize
    window.addEventListener("resize", updateSize);
    updateSize(); // Initial call

    return () => {
      window.removeEventListener("resize", updateSize);
      videoRef.current?.removeEventListener("loadeddata", updateSize);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!socket) return;
    socket.on("detection", (data) => {
      setBoxes(data || []);
    });

    return () => {
      socket.off("detection");
    };
  }, [socket]);

  return (
    <div className="display-canvas" style={{ position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ width: "100%", borderRadius: "0 0 20px 20px" }}
      />
      {boxes.map((box, index) => {
        // Convert percentage values to actual pixel values
        const x1 = box.box.x1 * videoSize.width;
        const x2 = box.box.x2 * videoSize.width;
        const y1 = box.box.y1 * videoSize.height;
        const y2 = box.box.y2 * videoSize.height;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x1,
              top: y1,
              width: x2 - x1,
              height: y2 - y1,
              border: "3px solid red",
              boxSizing: "border-box",
              backgroundColor: "rgba(0, 0, 0, 0.0)",
              // borderRadius: "20px",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                padding: "2px 5px",
                borderRadius: "3px",
                fontSize: "14px",
              }}
            >
              {((box.score / 5) * 10).toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default VideoDisplay;
