
'use client';

import { useState, useEffect } from 'react';
import styles from './AnimatedHegGeoLogo.module.css';

const TEXT_STAGES = [
  "#HEGGEO",     // Initial
  "#HEG  GEO",   // Space appears
  "#HEG    GEO", // Space widens
  "#HEg      GEO",// Case change 'G', space widens more
  "#Heg      GEO",// Case change 'H'
  "#Heg    GE",  // Space shrinks, 'O' disappears
  "#Heg  Geo",   // Space shrinks, 'o' reappears lowercase
  "#HegGeo"      // Final form
];

const STAGE_DURATIONS = [
  2500, // #HEGGEO
  800,  // #HEG  GEO
  800,  // #HEG    GEO
  800,  // #HEg      GEO
  800,  // #Heg      GEO
  800,  // #Heg    GE
  1200, // #Heg  Geo
  3000  // #HegGeo (final settle)
];

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
      setAnimationClass(styles.stage3); // Final settle for #HegGeo
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

