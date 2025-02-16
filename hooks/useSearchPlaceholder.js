import { useState, useEffect } from 'react';

export const useSearchPlaceholder = () => {
  const [searchPlaceholder, setSearchPlaceholder] = useState("");

  useEffect(() => {
    const phrase = "Search for hospitals and doctors.";
    let animationFrame;
    let startTime = Date.now();
    const letterDuration = 150;
    const pauseDuration = 2000;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const totalDuration = phrase.length * letterDuration;

      if (elapsed < totalDuration) {
        const numLetters = Math.floor(elapsed / letterDuration);
        setSearchPlaceholder(phrase.substring(0, numLetters));
        animationFrame = requestAnimationFrame(animate);
      } else if (elapsed < totalDuration + pauseDuration) {
        setSearchPlaceholder(phrase);
        animationFrame = requestAnimationFrame(animate);
      } else {
        startTime = Date.now();
        setSearchPlaceholder("");
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      setSearchPlaceholder("");
    };
  }, []);

  return searchPlaceholder;
}; 