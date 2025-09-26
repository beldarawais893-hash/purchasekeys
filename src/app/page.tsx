
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

const WelcomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // When the component mounts, set visitedWelcome to true in sessionStorage
    // only if the user is about to enter the site.
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('visitedWelcome', 'true');
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6">
            <KeyRound className="h-16 w-16 text-primary animate-pulse" />
        </div>
        
        <div className="h-20"></div>

        <div className="h-12 mt-8">
            <Button
              onClick={handleEnter}
              size="lg"
              className="animate-fade-in bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Enter
            </Button>
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
