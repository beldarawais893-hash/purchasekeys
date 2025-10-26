
'use client';

import { AppHeader } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  Search,
  Instagram,
  Megaphone,
  Clipboard,
  ClipboardCheck,
  ShieldCheck,
  ShoppingCart,
  Cpu,
  ArrowRight,
  Loader2,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getKeys } from '@/app/actions';
import type { Key } from '@/lib/types';
import { Badge } from '@/components/ui/badge';


const mods = [
  { name: 'Safe loader', status: 'available' },
  { name: 'Infinite mod', status: 'available' },
  { name: 'Ignis mod', status: 'available' },
  { name: 'Monster mod', status: 'available' },
  { name: 'Kristal mod', status: 'coming_soon' },
];

export default function Home() {
  const [searchKey, setSearchKey] = useState('');
  const { toast } = useToast();
  const [foundKeyInfo, setFoundKeyInfo] = useState<Key | null>(null);
  const [isKeyFoundDialogOpen, setIsKeyFoundDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [loadingMod, setLoadingMod] = useState<string | null>(null);


  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedWelcome');
    if (hasVisited !== 'true') {
      router.replace('/');
    }
  }, [router]);

  const handleCopy = () => {
    if (foundKeyInfo) {
      navigator.clipboard.writeText(foundKeyInfo.value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };
  
  const handleFindKey = async () => {
    const searchTerm = searchKey.trim();
    if (!searchTerm) {
      toast({
        title: 'Info',
        description: 'Please enter a Key or UTR to find.',
      });
      return;
    }

    setIsSearching(true);
    try {
        const keys = await getKeys();
        
        const foundKey = keys.find(k => k.status === 'claimed' && (k.utr === searchTerm || k.value === searchTerm));

      if (foundKey) {
            const claimedDate = new Date(foundKey.claimedAt!);
            const expiryDate = new Date(claimedDate);

            if (foundKey.plan.includes('Day')) {
                const days = parseInt(foundKey.plan.split(' ')[0], 10);
                expiryDate.setDate(claimedDate.getDate() + days);
            } else if (foundKey.plan.includes('Month')) {
                let months = 0;
                if (foundKey.plan.startsWith('1')) {
                    months = 1;
                } else if (foundKey.plan.startsWith('2')) {
                    months = 2;
                }
                expiryDate.setMonth(claimedDate.getMonth() + months);
            }

            if (new Date() > expiryDate) {
                toast({
                    title: 'Key Expired',
                    description: 'This key has expired. Please purchase a new key.',
                    variant: 'destructive',
                });
                setLoadingMod(null);
                return;
            }

             if (foundKey.utr === searchTerm) {
                // User searched by UTR, show them the key
                setFoundKeyInfo(foundKey);
                setIsKeyFoundDialogOpen(true);
             } else { // User searched by key value
                 toast({
                    title: 'Key Already Claimed',
                    description: `This key was claimed on ${new Date(foundKey.claimedAt!).toLocaleString()}. Your UTR is ${foundKey.utr}.`,
                    variant: 'default',
                });
             }

      } else {
        // Check if it is an available key
        const availableKey = (await getKeys()).find(k => k.value === searchTerm && k.status === 'available');
        if (availableKey) {
            toast({
                title: 'Key Available',
                description: `This key is valid and available for the ${availableKey.plan} plan.`,
                variant: 'default'
            });
        } else {
            toast({
              title: 'Invalid Key or UTR',
              description: 'No claimed key found for this Key or UTR number.',
              variant: 'destructive',
            });
        }
      }
    } catch (error) {
      console.error('Failed to find key in KV store', error);
      toast({
        title: 'Error',
        description: 'Could not perform the search. Check console for details.',
        variant: 'destructive',
      });
    } finally {
        setIsSearching(false);
    }
  };

  const handleSelectMod = (modName: string) => {
     setLoadingMod(modName);
     router.push(`/purchase?mod=${encodeURIComponent(modName)}`);
  };


  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline animate-text-glow [text-shadow:0_0_10px_hsl(var(--primary))]">
            MODS & KEYS
          </h1>
        </header>

        <div className="flex justify-end items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Input
              type="text"
              placeholder="Enter UTR No & Find your key"
              className="pr-10"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindKey()}
              disabled={isSearching}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleFindKey}
              disabled={isSearching}
            >
              <Search className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        <section id="purchase-mods" className="mb-12">
            <Card className="w-full bg-card/50 backdrop-blur-sm animate-border-glow">
                 <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Select Your Mod</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-hidden rounded-lg">
                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 font-semibold text-primary">
                            <div className="flex items-center gap-2"><Cpu className="h-5 w-5" /><span>MOD NAME</span></div>
                            <div className="flex items-center gap-2 justify-start"><ShoppingCart className="h-5 w-5" /><span>SELECT</span></div>
                        </div>
                        <div className="flex flex-col">
                            {mods.map((mod, index) => (
                                <div key={mod.name} className={`grid grid-cols-2 items-center gap-4 p-4 ${index < mods.length - 1 ? 'border-b border-border' : ''}`}>
                                    <div className="font-medium">{mod.name}</div>
                                    <div>
                                    {mod.status === 'available' ? (
                                        <Button 
                                            onClick={() => handleSelectMod(mod.name)} 
                                            size="sm" 
                                            className="bg-primary/90 hover:bg-primary justify-self-start"
                                            disabled={!!loadingMod}
                                        >
                                            {loadingMod === mod.name ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Selecting...
                                                </>
                                            ) : (
                                                <>
                                                    Select <ArrowRight className="ml-2 h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                                            <Clock className="mr-2 h-4 w-4" />
                                            Coming Soon
                                        </Badge>
                                    )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>

        <section id="contact-owner">
          <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm animate-border-glow">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Contact Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <a
                href="https://t.me/KristalOwner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none"
              >
                <Send className="mr-2 h-4 w-4" />
                @KristalOwner
              </a>
              <a
                href="https://t.me/+2rwJzhSwo_Y1N2E1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none"
              >
                <Megaphone className="mr-2 h-4 w-4" />
                Join Channel
              </a>
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Designed & Developed by – Awais Raza</p>
        <a
          href="https://www.instagram.com/awais_raza.4"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Instagram className="w-4 h-4" />
          Connect on Instagram: @awais_raza.4
        </a>
      </footer>

      <Dialog
        open={isKeyFoundDialogOpen}
        onOpenChange={setIsKeyFoundDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Key Found!
            </DialogTitle>
            <DialogDescription className="text-center">
              We found the access key associated with your UTR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center space-y-2">
              <p className="font-semibold">Your Personal Access Key:</p>
              <div className="flex w-full max-w-sm items-center space-x-2 rounded-lg border border-dashed border-primary/50 bg-secondary/50 p-3">
                <p className="flex-grow select-all break-all font-mono text-base font-bold text-primary">
                  {foundKeyInfo?.value}
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
              {isCopied && (
                <p className="text-sm text-green-400">Copied to clipboard!</p>
              )}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                UTR: <span className="font-mono">{foundKeyInfo?.utr}</span>
              </p>
              <p>
                Plan: <span>{foundKeyInfo?.plan}</span> for <span>{foundKeyInfo?.mod}</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    