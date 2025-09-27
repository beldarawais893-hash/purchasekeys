
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEXT_LINES = [
  "Welcome To My Site",
  "Purchase key and Enjoy Games"
];

export default function WelcomePage() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();
  const animationTriggered = useRef(false);

  useEffect(() => {
    // Clear the flag on initial load, so the welcome screen always runs its animation.
    sessionStorage.removeItem('hasVisitedWelcome');
  }, []);
  
  useEffect(() => {
    // This ref ensures the animation effect runs only once per component mount,
    // preventing the double-typing bug caused by React StrictMode's double-invocation.
    if (animationTriggered.current || currentLineIndex >= TEXT_LINES.length) {
      return;
    }

    animationTriggered.current = true;

    const handleTyping = () => {
      const currentLine = TEXT_LINES[currentLineIndex];
      let charIndex = 0;

      const typingInterval = setInterval(() => {
        if (charIndex < currentLine.length) {
          setTypedText((prev) => prev + currentLine.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          // Wait a moment before starting the next line or showing the button
          setTimeout(() => {
            if (currentLineIndex < TEXT_LINES.length - 1) {
              setCurrentLineIndex((prev) => prev + 1);
              setTypedText('');
              animationTriggered.current = false; // Reset for the next line
            } else {
              setShowButton(true);
            }
          }, 1000); 
        }
      }, 100);

       // Cleanup function to clear interval if component unmounts
      return () => clearInterval(typingInterval);
    };

    handleTyping();
    
  }, [currentLineIndex]);


  const handleEnter = () => {
    sessionStorage.setItem('hasVisitedWelcome', 'true');
    router.push('/home');
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex animate-fade-in items-center gap-4 text-primary">
        <KeyRound className="h-16 w-16" />
      </div>

      <div className="mt-8 h-16 text-center text-2xl font-semibold">
        {currentLineIndex < TEXT_LINES.length && (
            // Use a key to ensure React re-renders the paragraph for each line
            <p key={currentLineIndex}>{typedText}<span className="animate-ping">|</span></p>
        )}
      </div>

      {showButton && (
        <div className="mt-8 animate-fade-in">
          <Button 
             onClick={handleEnter}
             size="lg"
             className="bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:shadow-primary/50"
           >
            Enter
          </Button>
        </div>
      )}
    </div>
  );
}
