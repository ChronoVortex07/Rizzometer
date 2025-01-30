import React, { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Upload } from "lucide-react"; // Icon for upload button
import "./FileInput.css"; // Styles

interface FileInputProps {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Expose `openFileDialog` method using forwardRef
const FileInput = forwardRef<{ openFileDialog: () => void }, FileInputProps>(
  ({ handleFileChange }, ref) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("No file chosen");

    // Function to open file input dialog
    const openFileDialog = () => {
      fileInputRef.current?.click();
    };

    // Expose function to parent
    useImperativeHandle(ref, () => ({
      openFileDialog,
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFileName(e.target.files[0].name);
        handleFileChange(e);
      }
    };

    return (
      <div className="file-input-container">
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept="video/*"
          onChange={handleChange}
          style={{ display: "none" }} // Hide default input
        />
        <div className="file-path">{fileName}</div>
        <button className="upload-btn" onClick={openFileDialog}>
          <Upload className="upload-icon" size={20} />
          Upload
        </button>
      </div>
    );
  }
);

export default FileInput;
