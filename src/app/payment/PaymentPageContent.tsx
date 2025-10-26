
'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Copy,
  Check,
  Upload,
  IndianRupee,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { verifyPaymentWithAi } from '@/app/actions';


const UPI_ID = 'paytmqr6fauyo@ptys';
const PAYEE_NAME = 'KRISTAL KEYS';

export default function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const plan = searchParams.get('plan') || 'N/A';
  const price = searchParams.get('price') || '0';

  const qrCodeUrl = useMemo(() => {
    if (!price || price === '0') return null;
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${price}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  }, [price]);


  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'UPI ID has been copied to your clipboard.',
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Validate file type and size
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., PNG, JPG).',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
          title: 'File Too Large',
          description: 'Please upload a screenshot smaller than 4MB.',
          variant: 'destructive',
        });
        return;
      }
      setScreenshot(file);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleSubmit = async () => {
    if (!utrNumber.trim()) {
      toast({
        title: 'UTR Number Required',
        description: 'Please enter the UTR number from your payment.',
        variant: 'destructive',
      });
      return;
    }
    if (!screenshot) {
      toast({
        title: 'Screenshot Required',
        description: 'Please upload a screenshot of your payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    toast({
        title: 'Verifying Payment...',
        description: 'Our AI is checking your payment details. Please wait.',
    });

    try {
        const screenshotDataUri = await fileToDataUri(screenshot);
        
        const result = await verifyPaymentWithAi({
            screenshotDataUri,
            utrNumber: utrNumber.trim(),
            planPrice: price,
            planDuration: plan,
        });

        if (result.success && result.claimedKey) {
            toast({
                title: 'Verification Successful!',
                description: 'Redirecting to your key...',
            });
            const keyData = encodeURIComponent(JSON.stringify(result.claimedKey));
            router.push(`/success?keyData=${keyData}`);
        } else {
             toast({
                title: 'Verification Failed',
                description: result.message,
                variant: 'destructive',
                duration: 9000,
            });
        }

    } catch (error) {
        console.error("Verification error:", error);
        toast({
            title: 'An Error Occurred',
            description: 'Something went wrong. Please try again or contact support.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8">
       <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-3xl font-bold text-primary font-headline">Complete Your Payment</h1>
        <p className="text-muted-foreground">Follow the steps below to get your key.</p>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
        <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary"/> <span>{plan}</span></div>
                <div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary"/> <span className="font-bold text-2xl">{price}</span></div>
            </div>
          
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-4 text-center">
            <Label className="text-lg font-medium">Scan and Pay</Label>
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg border-4 border-white"
                />
              ) : (
                <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground text-sm">Loading QR...</p>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Or pay using the UPI ID below</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upiId" className="sr-only">UPI ID</Label>
            <div className="mt-4 flex w-full max-w-[280px] mx-auto items-center space-x-2 rounded-md border border-input bg-background/50 p-2">
              <span id="upiId" className="font-mono text-sm text-foreground break-all">{UPI_ID}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 shrink-0">
                {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utr">UTR Number</Label>
            <Input
              id="utr"
              placeholder="Enter payment UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshot">Upload Payment Screenshot</Label>
            <div className="flex items-center gap-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <Label htmlFor="screenshot" className={`flex-grow ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <div className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background hover:bg-accent hover:text-accent-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{screenshot ? screenshot.name : 'Choose a file'}</span>
                  </div>
                </Label>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-primary/90 hover:bg-primary">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Verifying...</> : 'Submit for Verification'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
