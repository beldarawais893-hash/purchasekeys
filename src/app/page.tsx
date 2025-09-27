
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
    sessionStorage.removeItem('hasVisitedWelcome');
  }, []);
  
  useEffect(() => {
    if (animationTriggered.current) return;
    animationTriggered.current = true;

    const handleTyping = () => {
      if (currentLineIndex >= TEXT_LINES.length) {
        setShowButton(true);
        return;
      }

      const currentLine = TEXT_LINES[currentLineIndex];
      let charIndex = 0;

      const typingInterval = setInterval(() => {
        if (charIndex < currentLine.length) {
          setTypedText((prev) => prev + currentLine[charIndex]);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(() => {
            setCurrentLineIndex((prev) => prev + 1);
            setTypedText('');
          }, 1000); 
        }
      }, 100);
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
