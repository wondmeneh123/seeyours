import React from "react";
import { useState, useEffect } from "react";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
} from "firebase/storage";
import { storage } from "../firebase";
import "./main.css";
const Gallery = () => {
  const [imageUrls, setImageUrls] = useState([]);

  const imagesListRef = ref(storage, "/videos");
  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      const promises = response.items.map((item) => getDownloadURL(item));
      Promise.all(promises).then((urls) => {
        setImageUrls(urls);
      });
    });
  }, []);
  
  return (
    <div className="container">
    <h1>Gallery</h1>
    <div className="grid-container">
        {imageUrls.map((url, index) => (
            <video key={index} src={url} className="vid" controls></video>
        ))}
    </div>
</div>
  );
};

export default Gallery;
