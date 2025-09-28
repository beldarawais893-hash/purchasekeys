
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
} from 'lucide-react';
import QRCode from 'qrcode';


const UPI_ID = '9058895955-c289@axl';

export default function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const plan = searchParams.get('plan') || 'N/A';
  const price = searchParams.get('price') || '0';

  useEffect(() => {
    if (qrRef.current) {
        const qrCodeUrl = `upi://pay?pa=${UPI_ID}&pn=Purchase&am=${price}&cu=INR`;
        QRCode.toCanvas(qrRef.current, qrCodeUrl, { width: 200, margin: 2 }, (error) => {
            if (error) console.error('Error generating QR code:', error);
        });
    }
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
      setScreenshot(e.target.files[0]);
    }
  };

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
        title: 'Submitting...',
        description: 'Please wait while we verify your payment.',
    });

    // We will add the logic to handle submission later
    console.log({
        plan,
        price,
        utrNumber,
        screenshotName: screenshot.name
    });

    // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        toast({
            title: 'Submission Received!',
            description: 'Your payment is being verified. You will receive your key shortly.',
        });
        router.push('/home'); // Redirect to home after submission
    }, 2000);

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
            <Label className="text-lg font-medium">Scan QR to Pay</Label>
            <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg">
                   <canvas ref={qrRef} />
              </div>
              <div className="mt-4 flex w-full max-w-[250px] items-center justify-center rounded-md border border-input bg-background/50 p-2">
                <span className="font-mono text-sm text-foreground break-all">{UPI_ID}</span>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 ml-2">
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="utr">UTR Number</Label>
            <Input
              id="utr"
              placeholder="Enter payment UTR number"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
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
                />
                <Label htmlFor="screenshot" className="flex-grow">
                  <div className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground ring-offset-background hover:bg-accent hover:text-accent-foreground">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{screenshot ? screenshot.name : 'Choose a file'}</span>
                  </div>
                </Label>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-primary/90 hover:bg-primary">
            {isSubmitting ? 'Submitting...' : 'Submit & Claim Key'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
