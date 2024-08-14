import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import uploadVideoToFirebase from "./Uploadtofirebase";
import "./main.css";
const WebcamStreamCapture = () => {
  const [uploadVideo, setUploadVideo] = useState(null);
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const currentTime = new Date();

  const handleStartCaptureClick = 
  useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
    if (recordedChunks.length > 0) {
      const videoBlob = new Blob(recordedChunks, { type: "video/webm" });
      uploadVideoToFirebase(videoBlob, currentTime)
        .then((filename) => {
          setUploadVideo(filename);
        })
        .catch((error) => {
          console.error("Error uploading video:", error);
        });
    }
    setRecordedChunks([]);
  }, [mediaRecorderRef, webcamRef, setCapturing, recordedChunks, currentTime]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = `${currentTime}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }, [recordedChunks, currentTime]);
 

  return (
    <div className="parent">
      <Webcam audio={true} width={800} ref={webcamRef} />
      <div className="btn-grp">
        {capturing ? (
          <button onClick={handleStopCaptureClick}>Stop Capture</button>
        ) : (
          <button onClick={handleStartCaptureClick}>Start Capture</button>
        )}
        {recordedChunks.length > 0 && (
          <>
            <button onClick={handleDownload}>Download</button>
            <br />
            {uploadVideo && <p>Video uploaded: {uploadVideo}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamStreamCapture;
