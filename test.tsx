import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const LiveYOLO = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);

  useEffect(() => {
    // Access the webcam
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    });

    // Handle YOLO detection results
    socket.on('detection', (data) => {
      setBoundingBoxes(data);
      console.log(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Send frames to the backend
    const interval = setInterval(() => {
      if (videoRef.current) {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (canvas && context) {
          context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const frame = canvas.toDataURL('image/jpeg');
          socket.emit('frame', frame);
        }
      }
    }, 1000); // Send every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} width={640} height={480} />
      <svg style={{ position: 'absolute', top: 0, left: 0 }}>
        {boundingBoxes.map((box, index) => (
          <rect
            key={index}
            x={box[0]}
            y={box[1]}
            width={box[2] - box[0]}
            height={box[3] - box[1]}
            style={{ fill: 'none', stroke: 'red', strokeWidth: 2 }}
          />
        ))}
      </svg>
    </div>
  );
};

export default LiveYOLO;