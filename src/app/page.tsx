
'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const WelcomePage = () => {
  const router = useRouter();
  const [firstLine, setFirstLine] = useState('');
  const [secondLine, setSecondLine] = useState('');
  const [showButton, setShowButton] = useState(false);

  const text1 = 'Welcome To My Site';
  const text2 = 'Purchase key and Enjoy Games';

  useEffect(() => {
    let typing1: NodeJS.Timeout;
    let typing2: NodeJS.Timeout;

    let i = 0;
    typing1 = setInterval(() => {
      if (i < text1.length) {
        setFirstLine((prev) => prev + text1.charAt(i));
        i++;
      } else {
        clearInterval(typing1);
        let j = 0;
        typing2 = setInterval(() => {
          if (j < text2.length) {
            setSecondLine((prev) => prev + text2.charAt(j));
            j++;
          } else {
            clearInterval(typing2);
            setShowButton(true);
          }
        }, 100);
      }
    }, 100);

    return () => {
      clearInterval(typing1);
      if (typing2) {
        clearInterval(typing2);
      }
    };
  }, []);

  const handleEnter = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4 font-headline animate-text-glow [text-shadow:0_0_10px_hsl(var(--primary))] h-20">
          <span className="typing-effect">{firstLine}</span>
        </h1>
        <p className="text-xl md:text-3xl text-foreground mb-8 h-12">
          <span className="typing-effect">{secondLine}</span>
        </p>
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
       <style jsx>{`
        .typing-effect {
          border-right: 0.15em solid hsl(var(--primary));
          white-space: nowrap;
          overflow: hidden;
          animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;
        }

        @keyframes typing {
          from { width: 0 }
          to { width: 100% }
        }

        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: hsl(var(--primary)); }
        }
        
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
