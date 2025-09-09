import React, { useState, useEffect, useRef } from 'react';
import PageLoading from '@/mycomponents/loading/PageLoading';
import ImageDictionary from './ImageDictionary';

const SHOW_IMAGE_TIME = 2350; // time each image is shown (ms)
const BLANK_SCREEN_TIME = 500; // blank interval time (ms)
const TOTAL_PHOTOS = 14;

const Stimuli = ({ isExpRunning, stimuliId, onImageChange }) => {
  const timerRef = useRef(null);
  const preloadedRef = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [shuffledIndices, setShuffledIndices] = useState([]);
  const [isBlank, setIsBlank] = useState(false);

  // Shuffle image indices and reset when experiment starts
  useEffect(() => {
    if (!isExpRunning || !stimuliId) return;
    const start = (stimuliId - 1) * TOTAL_PHOTOS + 1;
    const indices = Array.from({ length: TOTAL_PHOTOS }, (_, i) => start + i);
    setShuffledIndices(shuffleArray(indices));
    setCurrentIndex(0);

    // Clear any ongoing timer on cleanup
    return () => clearTimeout(timerRef.current);
  }, [isExpRunning, stimuliId]);

  // Preload images whenever the shuffled set changes
  useEffect(() => {
    preloadedRef.current = shuffledIndices.map(idx => {
      const img = new Image();
      img.src = `/img/${ImageDictionary[idx - 1]}`;
      return img;
    });
  }, [shuffledIndices]);

  // Handle slideshow loop with blank intervals
  useEffect(() => {
    if (!isExpRunning || currentIndex === -1 || shuffledIndices.length === 0) return;

    // Show next image after SHOW_IMAGE_TIME, then blank, then advance index
    timerRef.current = setTimeout(() => {
      setIsBlank(true);
      timerRef.current = setTimeout(() => {
        setIsBlank(false);
        setCurrentIndex(prev => (prev + 1) % TOTAL_PHOTOS);
      }, BLANK_SCREEN_TIME);
    }, SHOW_IMAGE_TIME);

    return () => clearTimeout(timerRef.current);
  }, [isExpRunning, currentIndex, shuffledIndices]);

  // Notify parent about current image index
  useEffect(() => {
    if (isExpRunning && currentIndex >= 0 && currentIndex < shuffledIndices.length) {
      onImageChange(shuffledIndices[currentIndex] - 1);
    }
  }, [currentIndex, isExpRunning, shuffledIndices, onImageChange]);

  // Render loading, blank, or the preloaded image
  if (!isExpRunning || currentIndex === -1 || preloadedRef.current.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen w-screen">
      {isBlank ? (
        <div className="w-full h-full bg-white" />
      ) : (
        <img
          src={preloadedRef.current[currentIndex].src}
          alt={`Stimuli ${shuffledIndices[currentIndex]}`}
          className="h-screen w-screen object-contain"
        />
      )}
    </div>
  );
};

// Fisher–Yates shuffle
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default Stimuli;