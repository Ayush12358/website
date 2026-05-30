import { useState, useEffect, useRef } from "react";

export function DecryptText({ 
  text, 
  delay = 0, 
  hoverTrigger = true 
}: { 
  text: string; 
  delay?: number; 
  hoverTrigger?: boolean; 
}) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<number | null>(null);
  const isFirstDecryptRef = useRef(true); // Track if initial load buffering is done
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&*+=%[]";

  const decrypt = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Split the text into words while keeping track of original spacings/newlines
    const words = text.split(/(\s+)/);
    let wordIndex = 0;
    
    // Speed based on whether the initial boot has finished
    const stepTime = isFirstDecryptRef.current ? 20 : 10;
    const windowSize = 5; // 5 words actively buffering at a time!

    intervalRef.current = window.setInterval(() => {
      let activeWordsCount = 0;
      let allDone = true;

      const mappedWords = words.map((w) => {
        // If it's a whitespace separator, preserve it exactly
        if (/^\s+$/.test(w)) return w;

        // Count non-whitespace words
        const isWord = w.length > 0;
        let actualWordIndex = activeWordsCount;
        if (isWord) activeWordsCount++;

        // Word is fully decrypted (past the window)
        if (actualWordIndex < wordIndex) {
          return w;
        }

        // Word is inside the 5-word active scrambling window
        if (actualWordIndex >= wordIndex && actualWordIndex < wordIndex + windowSize) {
          allDone = false;
          // Scramble characters of this word
          return w
            .split("")
            .map(() => chars[Math.floor(Math.random() * chars.length)]!)
            .join("");
        }

        // Word is beyond the scrambling window (future words)
        allDone = false;
        // Replace with non-breaking spaces of identical width to prevent layout jumps
        return "\u00A0".repeat(w.length);
      });

      setDisplayText(mappedWords.join(""));

      if (allDone) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(text); // Ensure final matches exactly
        isFirstDecryptRef.current = false;
      } else {
        // Advance the sliding window
        wordIndex += isFirstDecryptRef.current ? 0.35 : 0.8;
      }
    }, stepTime);
  };

  useEffect(() => {
    const timer = setTimeout(decrypt, delay);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (hoverTrigger) decrypt();
  };

  return (
    <span onMouseEnter={handleMouseEnter} style={{ cursor: hoverTrigger ? 'crosshair' : 'default' }}>
      {displayText}
    </span>
  );
}
