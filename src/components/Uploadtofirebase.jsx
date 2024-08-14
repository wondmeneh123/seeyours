import { ref, uploadBytes } from "firebase/storage";
import { storage } from '../firebase';

const uploadVideoToFirebase = (videoBlob, currentTime) => {
  const storageRef = ref(storage, `videos/${currentTime}.webm`);
  
  return uploadBytes(storageRef, videoBlob)
    .then(() => {
      console.log("Video uploaded successfully");
      return `${currentTime}.webm`; // Return the filename or any other identifier
    })
    .catch(error => {
      console.error("Error uploading video:", error);
      throw error;
    });
};

export default uploadVideoToFirebase;
