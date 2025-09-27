
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEXT_LINES = ["Welcome To My Site", "Purchase key and Enjoy Games"];

export default function WelcomePage() {
  const [typedLine1, setTypedLine1] = useState('');
  const [typedLine2, setTypedLine2] = useState('');
  const [showButton, setShowButton] = useState(false);
  const router = useRouter();
  const animationTriggered = useRef(false);

  useEffect(() => {
    sessionStorage.removeItem('hasVisitedWelcome');
  }, []);

  useEffect(() => {
    if (animationTriggered.current) {
      return;
    }
    animationTriggered.current = true;

    const typeLine = (lineIndex: number, text: string, setter: (value: string) => void, callback: () => void) => {
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        if (charIndex < text.length) {
          setter(text.substring(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setTimeout(callback, 500); 
        }
      }, 100);
      return () => clearInterval(typingInterval);
    };

    typeLine(0, TEXT_LINES[0], setTypedLine1, () => {
      typeLine(1, TEXT_LINES[1], setTypedLine2, () => {
        setShowButton(true);
      });
    });
    
  }, []);

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
          <p className="text-primary">{typedLine1}{typedLine1.length < TEXT_LINES[0].length ? <span className="animate-ping">|</span> : ''}</p>
          <p className="text-accent">{typedLine2}{typedLine1.length === TEXT_LINES[0].length && typedLine2.length < TEXT_LINES[1].length ? <span className="animate-ping">|</span> : ''}</p>
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
