
'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clipboard, ClipboardCheck, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple CSS for confetti effect
const ConfettiStyles = () => (
  <style jsx global>{`
    @keyframes confetti-fall {
      0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 10;
    }
    .confetti {
      position: absolute;
      width: 8px;
      height: 16px;
      background: hsl(var(--primary));
      opacity: 0.8;
      animation: confetti-fall 5s linear infinite;
    }
    .confetti:nth-child(5n) { background: hsl(var(--accent)); }
    .confetti:nth-child(3n) { background: #ffc700; }
    .confetti:nth-child(2n) { background: #fff; }
  `}</style>
);


export default function SuccessPageContent() {
  const searchParams = useSearchParams();
  const purchasedKey = searchParams.get('key') || 'No key found';
  const [isCopied, setIsCopied] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate confetti pieces
    const pieces = Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="confetti"
        style={{
          left: `${Math.random() * 100}vw`,
          animationDelay: `${Math.random() * 5}s`,
          transform: `scale(${Math.random() * 0.5 + 0.5})`,
        }}
      />
    ));
    setConfettiPieces(pieces);
  }, []);


  const handleCopy = () => {
    navigator.clipboard.writeText(purchasedKey);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <>
      <ConfettiStyles />
      <div className="confetti-container">{confettiPieces}</div>
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <Card className="w-full max-w-lg overflow-hidden bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/20">
          <CardHeader className="pt-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className='text-4xl animate-pulse'>🎉</span>
            </div>
            <CardTitle className="text-3xl font-bold animate-text-glow [text-shadow:0_0_10px_hsl(var(--primary))]">
              Congratulations! Purchase Complete!
            </CardTitle>
            <CardDescription className="pt-2 text-base text-muted-foreground">
              Your premium access key is now ready. Copy it below and unlock the full potential.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="flex flex-col items-center space-y-3">
              <p className="font-semibold">Your Personal Access Key:</p>
              <div className="flex w-full max-w-sm items-center space-x-2 rounded-lg border border-dashed border-primary/50 bg-secondary/50 p-4">
                <p className="flex-grow select-all break-all font-mono text-lg font-bold text-primary">
                  {purchasedKey}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy key"
                >
                  {isCopied ? (
                    <ClipboardCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clipboard className="h-5 w-5" />
                  )}
                </Button>
              </div>
               {isCopied && <p className="text-sm text-green-400">Copied to clipboard!</p>}
            </div>

            <div className="border-t border-border pt-6 text-center">
                <h3 className="font-semibold text-lg mb-3">What's Next?</h3>
                <p className="text-muted-foreground mb-4">Enjoy the premium experience! For any help or to join our community, connect with us on Telegram.</p>
                 <div className="flex justify-center gap-4">
                    <Button asChild variant="outline">
                        <Link href="/">
                            Back to Home
                        </Link>
                    </Button>
                    <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                         <a
                            href="https://t.me/+Kv7fEX8f7TFkMjk1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Join Community
                          </a>
                    </Button>
                 </div>
            </div>
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-muted-foreground">
             <p className="text-sm">Designed & Developed by – Awais Raza</p>
        </footer>
      </div>
    </>
  );
}
