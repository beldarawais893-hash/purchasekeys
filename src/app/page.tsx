
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

const WelcomePage = () => {
  const router = useRouter();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [showButton, setShowButton] = useState(false);
  const effectRan = useRef(false);

  const line1 = "Welcome To My Site";
  const line2 = "Purchase key and Enjoy Games";

  useEffect(() => {
    if (effectRan.current) return;
    
    sessionStorage.setItem('onWelcomePage', 'true');

    const typeLine = (line: string, setText: React.Dispatch<React.SetStateAction<string>>, onComplete: () => void) => {
      let i = 0;
      setText(''); // Reset text before starting
      const typingInterval = setInterval(() => {
        if (i < line.length) {
          setText((prev) => prev + line.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          onComplete();
        }
      }, 100);
      return typingInterval;
    };

    const startAnimations = () => {
      const interval1 = typeLine(line1, setText1, () => {
        const interval2 = typeLine(line2, setText2, () => {
          setShowButton(true);
        });
      });
    };
    
    startAnimations();
    effectRan.current = true;

  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('visitedWelcome', 'true');
    sessionStorage.removeItem('onWelcomePage');
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
        <KeyRound className="h-16 w-16 text-primary mb-6 animate-pulse" />
        <div className="font-headline text-2xl md:text-4xl text-foreground mb-4 h-24 flex flex-col items-center justify-center">
            <p className="h-10">{text1}</p>
            <p className="h-10">{text2}</p>
        </div>
        {showButton && (
            <Button 
                onClick={handleEnter}
                className="animate-in fade-in duration-1000 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform shadow-lg shadow-primary/30"
            >
                Enter
            </Button>
        )}
    </div>
  );
};

export default WelcomePage;
