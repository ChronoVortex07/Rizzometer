import { useEffect} from "react";
import { useSocket } from "../../providers/SocketProvider";
import { useVideo } from "../../providers/VideoProvider";

const VideoInput: React.FC = () => {
  const { socket } = useSocket();
  const { captureFrame } = useVideo();

  useEffect(() => {
    if (!socket) return; // Ensure socket is available
    if (socket.disconnected) {
      console.warn("Socket is disconnected, skipping frame emission.");
      return;
    }
  
    const sendFrames = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        // console.log("🖼 Sending frame...");
        socket.emit("frame", frame);
      }
    }, 500); // Send frames every 100ms
  
    return () => clearInterval(sendFrames);
  }, [socket, captureFrame]);

  return <></>; // This component doesn't render anything
};

export default VideoInput;