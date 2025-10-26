
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clipboard, ClipboardCheck, Home } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import type { Key } from '@/lib/types';

// A simple confetti animation component
const Confetti = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = [];
        const particleCount = 200;
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                size: Math.random() * 10 + 2,
                speedX: Math.random() * 3 - 1.5,
                speedY: Math.random() * 5 + 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        let animationFrameId: number;
        const animate = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p, index) => {
                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > height) {
                   // Reset particle to top
                   p.x = Math.random() * width;
                   p.y = -p.size;
                }

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.fillRect(p.x, p.y, p.size, p.size);
                ctx.fill();
            });
            
            if (particles.length > 0) {
                 animationFrameId = requestAnimationFrame(animate);
            }
        };
        
        animate();

        // Stop animation after some time
        const timer = setTimeout(() => {
           cancelAnimationFrame(animationFrameId);
           if(canvas && ctx) {
                const fadeOut = setInterval(() => {
                    ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
                    ctx.fillRect(0, 0, width, height);
                    if (particles.length === 0) {
                        clearInterval(fadeOut);
                    }
                }, 50);
           }
        }, 4000);


        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(animationFrameId);
        }
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" />;
};


export default function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [claimedKey, setClaimedKey] = useState<Key | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showPage, setShowPage] = useState(false);
  
  useEffect(() => {
    const keyDataString = searchParams.get('keyData');
    if (keyDataString) {
      try {
        const keyData = JSON.parse(decodeURIComponent(keyDataString));
        setClaimedKey(keyData);
      } catch (error) {
        console.error("Failed to parse key data from URL", error);
        router.replace('/home');
        return;
      }
    } else {
      // If no key data is found, redirect to home to prevent direct access
      router.replace('/home');
      return;
    }
    
    // Hide the confetti after a delay and show the content
    const showTimer = setTimeout(() => setShowPage(true), 1000);
    
    return () => clearTimeout(showTimer);
  }, [router, searchParams]);

  const handleCopy = () => {
    if (claimedKey) {
      navigator.clipboard.writeText(claimedKey.value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!claimedKey) {
     return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading your key...</p>
        </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <Confetti />
      <div className={`z-10 w-full max-w-md transition-opacity duration-1000 ${showPage ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
        <Card className="bg-card/70 backdrop-blur-sm animate-border-glow text-center border-green-500 shadow-green-500/20 shadow-lg">
            <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 animate-pulse">
                <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold text-foreground font-headline">
                Congratulations!
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                    Your payment has been verified successfully. Here is your personal access key.
                </p>

                <div className="space-y-2">
                    <Label className="text-muted-foreground">Your Access Key for <span className="font-bold text-primary">{claimedKey.mod}</span> ({claimedKey.plan})</Label>
                    <div className="flex w-full items-center space-x-2 rounded-lg border-2 border-dashed border-primary/50 bg-secondary/50 p-4">
                        <p className="flex-grow select-all break-all font-mono text-lg font-bold text-primary">
                        {claimedKey.value}
                        </p>
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        aria-label="Copy key"
                        >
                        {isCopied ? (
                            <ClipboardCheck className="h-6 w-6 text-green-400" />
                        ) : (
                            <Clipboard className="h-6 w-6" />
                        )}
                        </Button>
                    </div>
                     {isCopied && <p className="text-sm text-green-400">Copied to clipboard!</p>}
                </div>
            
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Button
                        onClick={() => router.push('/home')}
                        className="w-full"
                        variant="outline"
                    >
                        <Home className="mr-2 h-4 w-4" /> Back to Home
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
