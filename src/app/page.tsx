
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

const WelcomePage = () => {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');

  const fullLine1 = "Welcome To My Site";
  const fullLine2 = "Purchase Key And Enjoy Games";

  useEffect(() => {
    // Set a flag in sessionStorage to indicate the user has seen the welcome screen.
    // This helps in routing logic on other pages.
    sessionStorage.setItem('visitedWelcome', 'true');

    let i = 0;
    const typingInterval1 = setInterval(() => {
      if (i < fullLine1.length) {
        setLine1((prev) => prev + fullLine1.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval1);
        let j = 0;
        const typingInterval2 = setInterval(() => {
          if (j < fullLine2.length) {
            setLine2((prev) => prev + fullLine2.charAt(j));
            j++;
          } else {
            clearInterval(typingInterval2);
            setTimeout(() => setShowButton(true), 500); // Show button after a short delay
          }
        }, 100);
        // This return is crucial for cleanup
        return () => clearInterval(typingInterval2);
      }
    }, 100);

    // Cleanup interval on component unmount
    return () => clearInterval(typingInterval1);
  }, []);

  const handleEnter = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
            <KeyRound className="h-16 w-16 text-primary animate-pulse" />
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 font-headline [text-shadow:0_0_8px_hsl(var(--primary))] h-16">
            {line1}
            {line1.length < fullLine1.length && <span className="animate-pulse">|</span>}
        </h1>
        
        <p className="text-xl md:text-3xl text-foreground mb-8 h-12">
            {line2}
            {line1.length === fullLine1.length && line2.length < fullLine2.length && <span className="animate-pulse">|</span>}
        </p>

        <div className="h-12 mt-8">
          {showButton && (
            <Button
              onClick={handleEnter}
              size="lg"
              className="animate-fade-in bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Enter
            </Button>
          )}
        </div>
      </div>
       <style jsx>{`
        .animate-fade-in {
            animation: fadeIn 1s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
