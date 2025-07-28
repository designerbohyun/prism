import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

function CctvPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      style={{ width: "100%", background: "#000" }}
    />
  );
}

export default CctvPlayer;
