import "./App.css";
// import "./styles/variables.css"; // Import global variables
// import "./styles/fonts.css"; // Import custom fonts

import AppProviders from "./providers/AppProviders";
import TopBar from "./components/TopBar/TopBar";
import VideoInput from "./components/VideoInput/VideoInput";
import VideoDisplay from "./components/DisplayCanvas/DisplayCanvas";

function App() {
  return (
    <AppProviders>
      <div className="App">
        <TopBar />
        <VideoInput />
        <VideoDisplay />
      </div>
    </AppProviders>
  );
}

export default App;