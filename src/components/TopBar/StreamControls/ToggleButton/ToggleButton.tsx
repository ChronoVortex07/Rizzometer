import React from "react";
import "./ToggleButton.css";

interface ToggleButtonProps {
  isChecked: boolean; // External state
  handleToggle: (isChecked: boolean) => void; // Callback function
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isChecked, handleToggle }) => {
  const handleChange = () => {
    handleToggle(!isChecked);
  };

  return (
    <div className="toggle-button-cover">
      <div className="button r" id="button-9">
        <input 
          type="checkbox" 
          className="checkbox" 
          checked={isChecked} 
          onChange={handleChange} 
        />
        <div className="knobs">
          <span></span>
        </div>
        <div className="layer"></div>
      </div>
    </div>
  );
};

export default ToggleButton;