
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Search, Copy, Check, Upload, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { verifyPaymentWithAi } from '@/app/actions';

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  claimedAt?: string;
  status: 'available' | 'claimed';
};

type Plan = {
  id: number;
  duration: string;
  price: string;
};

const plans: Plan[] = [
  { id: 1, duration: '1 Day', price: '200 Rs' },
  { id: 2, duration: '3 Day', price: '350 Rs' },
  { id: 3, duration: '7 Day', price: '500 Rs' },
  { id: 4, duration: '15 Day', price: '720 Rs' },
  { id: 5, duration: '1 Month', price: '1000 Rs' },
];

const UPI_ID = '9058895955-c289@axl';
const PAYEE_NAME = 'Kaalbhairavmodzowner';

export function PurchaseSchedule() {
  const { toast } = useToast();
  const [searchKey, setSearchKey] = useState('');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handlePurchaseClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentStep(1);
    setUtrNumber('');
    setScreenshotFile(null);
    setIsVerifying(false);
    setIsPaymentDialogOpen(true);
  };
  
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToVerification = () => {
    setPaymentStep(2);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload a screenshot under 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setScreenshotFile(file);
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }


  const handleConfirmPurchase = async () => {
     if (!selectedPlan || !screenshotFile || !utrNumber.trim()) {
      toast({
        title: 'Verification Required',
        description: 'Please enter the UTR number and upload the payment screenshot.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsVerifying(true);

    try {
        const screenshotDataUri = await fileToDataUri(screenshotFile);
        const verificationResult = await verifyPaymentWithAi({
            screenshotDataUri,
            utrNumber: utrNumber.trim(),
            expectedAmount: selectedPlan.price.split(' ')[0],
            expectedUpiId: UPI_ID,
        });

        if (!verificationResult.isVerified) {
            toast({
                title: 'Payment Verification Failed',
                description: verificationResult.reason,
                variant: 'destructive',
                duration: 9000,
            });
            setIsVerifying(false);
            return;
        }

        toast({
          title: 'Payment Verified!',
          description: 'Your payment has been successfully verified. Issuing key...',
        });


      const storedKeys = localStorage.getItem('appKeys');
      if (!storedKeys) {
        toast({ title: 'Error', description: 'No keys available.', variant: 'destructive' });
        setIsVerifying(false);
        setIsPaymentDialogOpen(false);
        return;
      }
      
      let keys: Key[] = JSON.parse(storedKeys);
      const availableKeyIndex = keys.findIndex(k => k.plan === selectedPlan.duration && k.status === 'available');

      if (availableKeyIndex === -1) {
        toast({ title: 'Sold Out!', description: `Sorry, all keys for the ${selectedPlan.duration} plan are currently sold out.`, variant: 'destructive' });
        setIsPaymentDialogOpen(false);
        setIsVerifying(false);
        return;
      }

      const keyToClaim = keys[availableKeyIndex];
      keys[availableKeyIndex] = {
        ...keyToClaim,
        status: 'claimed',
        claimedAt: new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date()),
      };

      localStorage.setItem('appKeys', JSON.stringify(keys));

      toast({
        title: 'Purchase Successful!',
        description: `Your key is: ${keyToClaim.value}. It has been copied to your clipboard.`,
        duration: 9000,
      });
      navigator.clipboard.writeText(keyToClaim.value);

    } catch (error) {
      console.error("Failed to process purchase with AI verification", error);
      toast({ title: 'Error', description: 'An unexpected error occurred during verification.', variant: 'destructive' });
    } finally {
      setIsVerifying(false);
      setIsPaymentDialogOpen(false);
      setSelectedPlan(null);
      setPaymentStep(1);
      setUtrNumber('');
      setScreenshotFile(null);
    }
  };

  const handleFindKey = () => {
    if (!searchKey.trim()) {
      toast({ title: 'Info', description: 'Please enter a key to find.' });
      return;
    }
    try {
      const storedKeys = localStorage.getItem('appKeys');
      if (!storedKeys) {
        toast({ title: 'Not Found', description: 'The key you entered does not exist.', variant: 'destructive' });
        return;
      }
      const keys: Key[] = JSON.parse(storedKeys);
      const foundKey = keys.find(k => k.value === searchKey.trim());

      if (foundKey) {
        if (foundKey.status === 'claimed') {
          toast({ title: 'Key Already Claimed', description: `This key was claimed on ${foundKey.claimedAt}.`, variant: 'destructive' });
        } else {
          toast({ title: 'Key Available', description: `This key is valid and available for the ${foundKey.plan} plan.` });
        }
      } else {
        toast({ title: 'Invalid Key', description: 'The key you entered does not exist.', variant: 'destructive' });
      }
    } catch (error) {
      console.error("Failed to find key", error);
      toast({ title: 'Error', description: 'Could not perform the search.', variant: 'destructive' });
    }
  };
  
  const qrCodeUrl = selectedPlan ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${selectedPlan.price.split(' ')[0]}&cu=INR&tn=Payment for ${selectedPlan.duration}` : '';


  return (
    <>
    <div className="flex justify-end items-center mb-4">
       <div className="relative w-full max-w-xs">
         <Input
          type="text"
          placeholder="Find Your Key"
          className="bg-transparent pr-10"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFindKey()}
        />
        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={handleFindKey}>
            <Search className="w-5 h-5 text-primary" />
        </Button>
       </div>
    </div>
    <Card className="bg-card border-none">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50">
              <TableHead className="w-1/3 text-foreground font-semibold">Days</TableHead>
              <TableHead className="w-1/3 text-foreground font-semibold">Price</TableHead>
              <TableHead className="text-right w-1/3 text-foreground font-semibold">Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id} className="border-b border-border/20">
                <TableCell className="font-medium">{plan.duration}</TableCell>
                <TableCell>{plan.price}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handlePurchaseClick(plan)}
                  >
                    Buy
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
           {paymentStep === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">Scan to Pay</DialogTitle>
                <DialogDescription className="text-center">
                  Use any UPI app to scan the QR code and pay for the {selectedPlan?.duration} plan.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                 {selectedPlan && (
                    <Image
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg border-4 border-white"
                    />
                )}
                <div className="text-center">
                    <p className="font-semibold text-lg">Amount: {selectedPlan?.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-muted-foreground break-all">{UPI_ID}</p>
                         <Button variant="ghost" size="icon" onClick={handleCopyUpiId} className="h-8 w-8">
                          {copied ? <Check className="text-green-500" /> : <Copy />}
                        </Button>
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground text-center">After successful payment, click the button below to verify your payment.</p>
              </div>
              <DialogFooter>
                <Button onClick={handleProceedToVerification} className="w-full bg-primary hover:bg-primary/90">
                  I have paid, verify my payment
                </Button>
              </DialogFooter>
            </>
          )}

          {paymentStep === 2 && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold">Verify Your Payment</DialogTitle>
                <DialogDescription className="text-center">
                  Enter your payment UTR number and upload a screenshot to receive your key.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-4 space-y-4">
                <div className="w-full space-y-2">
                    <Label htmlFor="utr-number">UTR/Transaction ID</Label>
                    <Input 
                        id="utr-number" 
                        placeholder="Enter 12-digit UTR number" 
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        disabled={isVerifying}
                    />
                </div>
                <div className="w-full space-y-2">
                    <Label htmlFor="screenshot">Payment Screenshot</Label>
                    <Input 
                        id="screenshot"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept="image/png, image/jpeg, image/jpg"
                        disabled={isVerifying}
                    />
                    <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isVerifying}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {screenshotFile ? screenshotFile.name : 'Upload Screenshot'}
                    </Button>
                    <p className="text-xs text-muted-foreground">Note: Please check UPI ID, amount and UTR number in screenshot.</p>
                </div>
              </div>
              <DialogFooter className="flex-col gap-2 sm:flex-row">
                 <Button onClick={() => setPaymentStep(1)} variant="outline" className="w-full" disabled={isVerifying}>Back</Button>
                <Button onClick={handleConfirmPurchase} className="w-full bg-primary hover:bg-primary/90" disabled={isVerifying}>
                  {isVerifying ? <Loader2 className="animate-spin" /> : 'Confirm Purchase'}
                </Button>
              </DialogFooter>
            </>
          )}

        </DialogContent>
      </Dialog>
    </>
  );
}
