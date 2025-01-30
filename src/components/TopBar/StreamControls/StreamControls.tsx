import "./StreamControls.css";
import { useVideo } from "../../../providers/VideoProvider";
import React, { useState, useEffect, useRef } from "react";
import ToggleButton from "./ToggleButton/ToggleButton";
import FileInput from "./FileInput/FileInput";

const StreamControls: React.FC = () => {
    const { toggleVideoSource, setUseVideoFile } = useVideo();
    const [buttonState, setButtonState] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const fileInputRef = useRef<{ openFileDialog: () => void }>(null);

    const handleToggle = (isChecked: boolean) => {
        if (isChecked && !fileUrl) {
            // Prevent toggling ON if no file is selected
            fileInputRef.current?.openFileDialog();
            setButtonState(false);
            return;
        }

        setUseVideoFile(isChecked);
        setButtonState(isChecked);
        toggleVideoSource(isChecked ? fileUrl : null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFileUrl(url);
            toggleVideoSource(url);
            setButtonState(true); // Automatically turn on when a file is selected
        } else {
            setFileUrl(null);
            toggleVideoSource(null);
            setButtonState(false); // Turn off if no file
        }
    };

    // Automatically revert the toggle OFF if fileUrl becomes null
    useEffect(() => {
        if (!fileUrl) {
            setButtonState(false);
            setUseVideoFile(false);
            toggleVideoSource(null);
        }
    }, [fileUrl, setUseVideoFile, toggleVideoSource]);

    return (
        <div className="stream-control-container">
            <ToggleButton isChecked={buttonState} handleToggle={handleToggle} />
            <FileInput ref={fileInputRef} handleFileChange={handleFileChange} />
        </div>
    );
};

export default StreamControls;
