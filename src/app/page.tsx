
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

const WelcomePage = () => {
  const router = useRouter();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [showButton, setShowButton] = useState(false);

  const line1 = "Welcome To My Site";
  const line2 = "Purchase key and Enjoy Games";

  useEffect(() => {
    // Set a flag that we are on the welcome page, so other pages don't redirect.
    sessionStorage.setItem('onWelcomePage', 'true');

    const typeLine1 = () => {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < line1.length) {
          setText1((prev) => prev + line1.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          typeLine2();
        }
      }, 100);
    };

    const typeLine2 = () => {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < line2.length) {
          setText2((prev) => prev + line2.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
          setShowButton(true);
        }
      }, 100);
    };

    typeLine1();
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
