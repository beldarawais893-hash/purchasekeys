
'use client';

import { AppHeader } from '@/components/header';
import { PurchaseSchedule } from '@/components/purchase-schedule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  claimedAt?: string;
  status: 'available' | 'claimed';
  utr?: string;
};

export default function Home() {
  const [searchKey, setSearchKey] = useState('');
  const { toast } = useToast();
  const [foundKeyInfo, setFoundKeyInfo] = useState<Key | null>(null);
  const [isKeyFoundDialogOpen, setIsKeyFoundDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    if (foundKeyInfo) {
      navigator.clipboard.writeText(foundKeyInfo.value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  const handleFindKey = () => {
    const searchTerm = searchKey.trim();
    if (!searchTerm) {
      toast({
        title: 'Info',
        description: 'Please enter a Key or UTR to find.',
      });
      return;
    }
    try {
      const storedKeys = localStorage.getItem('appKeys');
      if (!storedKeys) {
        toast({
          title: 'Not Found',
          description: 'No keys found in the system.',
          variant: 'destructive',
        });
        return;
      }
      const keys: Key[] = JSON.parse(storedKeys);

      let foundKey = keys.find((k) => k.value === searchTerm);

      if (!foundKey) {
        foundKey = keys.find(
          (k) => k.status === 'claimed' && k.utr === searchTerm
        );
        if (foundKey) {
          setFoundKeyInfo(foundKey);
          setIsKeyFoundDialogOpen(true);
          return;
        }
      }

      if (foundKey) {
        if (foundKey.status === 'claimed') {
          toast({
            title: 'Key Already Claimed',
            description: `This key was claimed on ${foundKey.claimedAt}. Your UTR is ${foundKey.utr}.`,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Key Available',
            description: `This key is valid and available for the ${foundKey.plan} plan.`,
          });
        }
      } else {
        toast({
          title: 'Invalid Key or UTR',
          description: 'The Key or UTR you entered does not exist.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to find key', error);
      toast({
        title: 'Error',
        description: 'Could not perform the search.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline animate-text-glow [text-shadow:0_0_10px_hsl(var(--primary))]">
            Purchase Schedule
          </h1>
        </header>

        <div className="flex justify-end items-center mb-4">
          <div className="relative w-full max-w-xs">
            <Input
              type="text"
              placeholder="Find by Key or UTR"
              className="pr-10"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindKey()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleFindKey}
            >
              <Search className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>

        <section id="purchase-schedule" className="mb-12">
          <PurchaseSchedule />
        </section>

        <section id="contact-owner">
          <Card className="max-w-md mx-auto bg-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">
                Contact Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <a
                href="https://t.me/Kaalbhairavmodzowner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none"
              >
                <Send className="mr-2 h-4 w-4" />
                Kaalbhairavmodzowner
              </a>
              <a
                href="https://t.me/ImpalerVLAED"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none"
              >
                <Send className="mr-2 h-4 w-4" />
                ImpalerVLAED
              </a>
              <a
                href="https://t.me/+Kv7fEX8f7TFkMjk1"
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
                Plan: <span>{foundKeyInfo?.plan}</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
