
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
import { Copy, Check, Upload, Loader2, ShoppingCart, CalendarDays, IndianRupee } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  claimedAt?: string;
  status: 'available' | 'claimed';
  utr?: string;
};

type Plan = {
  id: number;
  duration: string;
  price: string;
};

const plans: Plan[] = [
  { id: 1, duration: '1 Day', price: '200' },
  { id: 2, duration: '3 Day', price: '350' },
  { id: 3, duration: '7 Day', price: '500' },
  { id: 4, duration: '15 Day', price: '720' },
  { id: 5, duration: '1 Month', price: '1000' },
];

const UPI_ID = '9058895955-c289@axl';
const PAYEE_NAME = 'Kaalbhairavmodzowner';

export function PurchaseSchedule() {
  const { toast } = useToast();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isQrLoading, setIsQrLoading] = useState(true);


  const handlePurchaseClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setUtrNumber('');
    setScreenshotFile(null);
    setIsVerifying(false);
    setIsQrLoading(true);
    setIsPaymentDialogOpen(true);
  };
  
  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        const enteredUtr = utrNumber.trim();
        const storedKeys = localStorage.getItem('appKeys');
        let keys: Key[] = storedKeys ? JSON.parse(storedKeys) : [];
        
        const isUtrUsed = keys.some(key => key.status === 'claimed' && key.utr === enteredUtr);
        if (isUtrUsed) {
            toast({
                title: 'Duplicate UTR',
                description: 'This UTR number has already been used for a purchase.',
                variant: 'destructive',
            });
            setIsVerifying(false);
            return;
        }

        const screenshotDataUri = await fileToDataUri(screenshotFile);
        const verificationResult = await verifyPaymentWithAi({
            screenshotDataUri,
            utrNumber: enteredUtr,
            expectedAmount: selectedPlan.price,
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
        utr: enteredUtr,
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
      setUtrNumber('');
      setScreenshotFile(null);
    }
  };

  const qrCodeUrl = selectedPlan ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}&pn=${PAYEE_NAME}&am=${selectedPlan.price}&cu=INR&tn=Payment for ${selectedPlan.duration}` : '';

  return (
    <>
    <Card className="bg-card overflow-hidden shadow-lg shadow-primary/20 border border-primary/30">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/20 bg-primary/10 hover:bg-primary/20">
              <TableHead className="w-1/3 text-primary uppercase tracking-wider font-bold">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>Days</span>
                </div>
              </TableHead>
              <TableHead className="w-1/3 text-primary uppercase tracking-wider font-bold">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  <span>Price</span>
                </div>
              </TableHead>
              <TableHead className="text-right w-1/3 text-primary uppercase tracking-wider font-bold">
                <div className="flex items-center justify-end gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Purchase</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="border-b border-border/20"
              >
                <TableCell className="font-medium peer-hover:bg-primary/10 transition-colors duration-300">{plan.duration}</TableCell>
                <TableCell className="peer-hover:bg-primary/10 transition-colors duration-300">{plan.price} Rs</TableCell>
                <TableCell className="text-right transition-colors duration-300">
                  <Button
                    size="sm"
                    className="peer bg-accent text-accent-foreground shadow-md shadow-accent/20 hover:shadow-lg hover:shadow-accent/40 hover:bg-accent/90 transition-all duration-300 hover:scale-110 active:scale-125"
                    onClick={() => handlePurchaseClick(plan)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
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
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Complete Your Purchase</DialogTitle>
            <DialogDescription className="text-center">
              Pay for the {selectedPlan?.duration} plan, then enter details to verify.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
              {/* QR Code and UPI */}
              <div className="text-center">
                  <p className="font-semibold text-lg">1. Scan & Pay</p>
                  <div className="relative w-[180px] h-[180px] mx-auto my-2">
                    {isQrLoading && <Skeleton className="absolute inset-0 rounded-lg" />}
                    {selectedPlan && (
                        <Image
                          src={qrCodeUrl}
                          alt="UPI QR Code"
                          width={180}
                          height={180}
                          className="rounded-lg border-4 border-white"
                          onLoad={() => setIsQrLoading(false)}
                          onError={() => setIsQrLoading(false)}
                        />
                    )}
                  </div>
                  <p className="font-semibold">Amount: {selectedPlan?.price} Rs</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                      <p className="text-muted-foreground break-all">{UPI_ID}</p>
                       <Button variant="ghost" size="icon" onClick={handleCopyUpiId} className="h-8 w-8">
                        {copied ? <Check className="text-green-500" /> : <Copy />}
                      </Button>
                  </div>
              </div>

              <div className="w-full border-t border-border/50"></div>

              {/* Verification Inputs */}
              <div className="w-full space-y-4 text-center">
                <p className="font-semibold text-lg">2. Verify Payment</p>
                <div className="w-full space-y-2 text-left">
                    <Label htmlFor="utr-number">UTR/Transaction ID</Label>
                    <Input 
                        id="utr-number" 
                        placeholder="Enter 12-digit UTR number" 
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        disabled={isVerifying}
                        className="bg-background"
                    />
                </div>
                <div className="w-full space-y-2 text-left">
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
                        className="w-full justify-start text-muted-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isVerifying}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {screenshotFile ? screenshotFile.name : 'Upload Screenshot'}
                    </Button>
                </div>
              </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleConfirmPurchase} className="w-full bg-primary hover:bg-primary/90" disabled={isVerifying}>
              {isVerifying ? <Loader2 className="animate-spin" /> : 'Verify & Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
