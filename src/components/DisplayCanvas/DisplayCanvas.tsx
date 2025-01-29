import "./DisplayCanvas.css"

import React, { useEffect, useState } from "react";
import { useSocket } from "../../providers/SocketProvider";
import { useVideo } from "../../providers/VideoProvider";

const VideoDisplay: React.FC = () => {
  const { videoRef } = useVideo();
  const { socket } = useSocket();
  const [boxes, setBoxes] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("detection", (data) => {
      if (!data) return;
    //   console.log(data);
      setBoxes(data);
    });

    return () => {
      socket.off("detection");
    };
  }, [socket]);

  const videoWidth = videoRef.current?.videoWidth || 0;
  const videoHeight = videoRef.current?.videoHeight || 0;

  return (
    <div className="display-canvas" style={{ position: "relative" }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: "100%" }} />
      {boxes.map((box, index) => {
        // Convert percentage values to pixel values
        const x1 = box.box.x1 * videoWidth;
        const x2 = box.box.x2 * videoWidth;
        const y1 = box.box.y1 * videoHeight;
        const y2 = box.box.y2 * videoHeight;

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x1,
              top: y1,
              width: x2 - x1,  // Box width in pixels
              height: y2 - y1, // Box height in pixels
              border: "2px solid red",
              boxSizing: "border-box",  // Ensure the box sizing doesn't affect the dimensions
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
              {(box.score / 5 * 10).toFixed(2)} {/* Displaying the score */}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default VideoDisplay;
