import React from 'react';

const API_PATH = import.meta.env.VITE_API_PATH;
const videoUrl = API_PATH + "/common/stream?filename=";

const VideoPlayer = () => {

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <video controls width="100%">
        <source src={videoUrl} type="video/webm" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
