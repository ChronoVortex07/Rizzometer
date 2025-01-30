import "./TopBar.css";

import StreamControls from "./StreamControls/StreamControls";

const TopBar: React.FC = () => {
  return (
    <div className="TopBar">
      <div>
        <h1 className="sweet-title">✨Rizzometer✨</h1>
      </div>
      <StreamControls />
    </div>
  );
};

export default TopBar;
