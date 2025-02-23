import { useState, useEffect } from "react";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleSize();
    if (window) {
      window.addEventListener("resize", handleSize);
      handleSize();
    }

    return () => {
      if (window) {
        window.removeEventListener("resize", handleSize);
      }
    };
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < 768,
  };
};
