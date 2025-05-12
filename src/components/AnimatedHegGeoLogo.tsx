
'use client';

import { useState, useEffect } from 'react';
import styles from './AnimatedHegGeoLogo.module.css';

const TEXT_STAGES = ["#HEGGEO", "#Heg Geo", "#HegGeo"];
const STAGE_DURATIONS = [3000, 2500, 3500]; // Durations for each text/animation stage in ms

const AnimatedHegGeoLogo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentText, setCurrentText] = useState(TEXT_STAGES[0]);
  const [animationClass, setAnimationClass] = useState(styles.stage1);

  useEffect(() => {
    // Update text first
    setCurrentText(TEXT_STAGES[currentIndex]);

    // Then set animation class based on current text/stage
    if (TEXT_STAGES[currentIndex] === "#HEGGEO") {
      setAnimationClass(styles.stage1); // Pulsing
    } else if (TEXT_STAGES[currentIndex] === "#Heg Geo") {
      setAnimationClass(styles.stage2); // Bursting
    } else {
      setAnimationClass(styles.stage3); // Refining
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
