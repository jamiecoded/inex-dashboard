import { useEffect, useState } from "react";
import { animate } from "framer-motion";

export function useDecryptNumber(
  value: number,
  formatter: (val: number) => string,
  duration: number = 1.2
) {
  const [display, setDisplay] = useState(() => {
    const finalStr = formatter(value);
    return finalStr.replace(/[0-9]/g, "0");
  });

  useEffect(() => {
    const finalString = formatter(value);
    const chars = "0123456789";
    
    // Calculate how many numbers exist to stagger their reveal
    const numDigits = finalString.replace(/[^0-9]/g, "").length;
    let digitCount = 0;
    
    const controls = animate(0, 1, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        if (latest >= 1) {
          setDisplay(finalString);
          return;
        }

        digitCount = 0;
        const randomized = finalString
          .split("")
          .map((char) => {
            if (/[0-9]/.test(char)) {
              digitCount++;
              // Reveal digits from left to right based on progress
              if (latest > digitCount / (numDigits + 1)) {
                return char;
              }
              return chars[Math.floor(Math.random() * chars.length)];
            }
            return char;
          })
          .join("");
          
        setDisplay(randomized);
      },
    });

    return controls.stop;
  }, [value, duration, formatter]);

  return display;
}
