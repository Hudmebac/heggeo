
'use client';

import { useState, useEffect } from 'react';
import styles from './AnimatedHegGeoLogo.module.css';

const TEXT_STAGES = [
  "#HEGGEO",
  "#HEG  GEO",
  "#HEG    GEO",
  "#HEg      GEO",
  "#Heg      GEO",
  "#Heg    GEo",
  "#Heg  Geo",
  "#HegGeo",
  "#HegGe",
  "#HegG",
  "#Heg",
  "#He",
  "#H",
  "#HE",
  "#HEG",
  "#HEGG",
  "#HEGGE",
  "#HEGGEO", // Loops back to the start
];

// Set all durations to 2000ms (2 seconds)
const STAGE_DURATIONS = Array(TEXT_STAGES.length).fill(2000);


const AnimatedHegGeoLogo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState(TEXT_STAGES[0]);
  const [animationClass, setAnimationClass] = useState(styles.stage1);

  useEffect(() => {
    setCurrentText(TEXT_STAGES[currentIndex]);

    // Set animation class based on current stage
    if (currentIndex === 0) {
      setAnimationClass(styles.stage1); // Initial pulse for #HEGGEO
    } else if (currentIndex === TEXT_STAGES.length - 1) { 
      // The last stage is a repeat of the first, so use fadeInAndSettle before it loops to pulse
      setAnimationClass(styles.stage3); 
    } else {
      // Use burst animation for all intermediate transition stages
      setAnimationClass(styles.stage2); 
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % TEXT_STAGES.length);
    }, STAGE_DURATIONS[currentIndex]);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className={`${styles.logoContainer} font-orbitron uppercase tracking-wider text-xl sm:text-2xl font-bold`}>
      <span className={`${styles.animatedText} ${animationClass}`} data-text={currentText}>
        {currentText}
      </span>
    </div>
  );
};

export default AnimatedHegGeoLogo;
