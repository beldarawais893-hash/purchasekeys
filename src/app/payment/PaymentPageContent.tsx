
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Upload,
  Loader2,
  FilePenLine,
  Wand2,
  Trash2,
  ShieldCheck,
  IndianRupee,
  ScanLine,
} from 'lucide-react';
import { getKeys, saveKeys, verifyPaymentWithAi, editScreenshotWithAi } from '@/app/actions';
import type { Key } from '@/app/actions';
import { usePaymentParams } from './use-payment-params';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


// The UPI ID and QR code URL are constants for this application
const UPI_ID = 'itskaalbhairav@paytm';
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${UPI_ID}`;

export default function PaymentPageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { plan, price } = usePaymentParams();
  
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB size limit
        toast({
            title: 'File Too Large',
            description: 'Please upload a screenshot under 4MB.',
            variant: 'destructive',
        });
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!utrNumber || !screenshotFile || !screenshotPreview) {
      toast({
        title: 'Missing Information',
        description: 'Please enter the UTR number and upload a screenshot.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify Payment with AI
      const verificationResult = await verifyPaymentWithAi({
        screenshotDataUri: screenshotPreview,
        utrNumber,
        expectedAmount: price.toString(),
        expectedUpiId: UPI_ID,
      });

      if (!verificationResult.isVerified) {
        toast({
          title: 'Verification Failed',
          description: verificationResult.reason,
          variant: 'destructive',
          duration: 7000,
        });
        setIsLoading(false);
        return;
      }
      
      toast({
          title: 'Payment Verified!',
          description: 'Your payment has been successfully verified. Finding an available key...',
          variant: 'default'
      })

      // 2. Find an available key for the purchased plan
      const keys = await getKeys();
      const availableKey = keys.find(
        (k) => k.status === 'available' && k.plan === plan
      );

      if (!availableKey) {
        toast({
          title: 'No Keys Available',
          description: `Sorry, there are no available keys for the ${plan} plan right now. Please contact the owner.`,
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // 3. Claim the key and update its status
      const updatedKey: Key = {
        ...availableKey,
        status: 'claimed',
        claimedAt: new Date().toISOString(),
        utr: utrNumber,
      };

      const updatedKeys = keys.map((k) =>
        k.id === updatedKey.id ? updatedKey : k
      );
      await saveKeys(updatedKeys);
      
      // 4. Redirect to success page
      router.push(`/success?key=${encodeURIComponent(updatedKey.value)}`);

    } catch (error) {
      console.error('Verification and key claim failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'An Error Occurred',
        description: `Failed to process your payment. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditScreenshot = async () => {
      if (!screenshotPreview || !editPrompt) {
          toast({ title: 'Error', description: 'No screenshot or prompt to edit.', variant: 'destructive'});
          return;
      }
      setIsLoading(true);
      try {
          const result = await editScreenshotWithAi({ screenshotDataUri: screenshotPreview, prompt: editPrompt });
          setScreenshotPreview(result.editedScreenshotDataUri);
          toast({ title: 'Success', description: 'Screenshot updated by AI.'});
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
          toast({ title: 'AI Edit Failed', description: errorMessage, variant: 'destructive'});
      } finally {
          setIsLoading(false);
          setIsEditing(false);
          setEditPrompt('');
      }
  }


  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-2xl font-bold text-foreground font-headline">
          Complete Your Purchase
        </h1>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Left Side: Instructions & QR */}
            <div className="space-y-6">
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                           <ScanLine className="text-primary"/>
                           Step 1: Scan & Pay
                        </CardTitle>
                        <CardDescription>
                            You have selected the <span className="font-bold text-primary">{plan}</span> plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                         <div className="text-center">
                            <p className="font-semibold text-lg">Total Amount</p>
                            <p className="text-4xl font-bold text-primary flex items-center justify-center">
                                <IndianRupee className="h-8 w-8" />
                                {price}
                            </p>
                        </div>

                        <div className="bg-white p-2 rounded-lg border-4 border-primary shadow-lg">
                             <Image
                                src={QR_CODE_URL}
                                alt="Payment QR Code"
                                width={200}
                                height={200}
                                priority
                            />
                        </div>
                       
                        <div className="text-center w-full">
                            <p className="text-muted-foreground">Or pay to this UPI ID:</p>
                            <p className="font-mono text-lg text-primary break-all">{UPI_ID}</p>
                        </div>
                    </CardContent>
                </Card>
                
                 <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Important!</AlertTitle>
                    <AlertDescription>
                        After payment, you will get a UTR / Transaction ID. You must enter this ID in Step 2 to verify your payment.
                    </AlertDescription>
                </Alert>
            </div>

            {/* Right Side: Verification */}
             <div className="space-y-6">
                 <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <ShieldCheck className="text-primary"/>
                            Step 2: Verify Payment
                        </CardTitle>
                        <CardDescription>
                           Enter your payment details and upload a screenshot to get your key.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="utr">UTR / Transaction ID</Label>
                            <Input
                            id="utr"
                            placeholder="Enter 12-digit UTR number"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="screenshot">Payment Screenshot</Label>
                            <Input
                                id="screenshot"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden" 
                                disabled={isLoading}
                            />
                            <Button
                                variant="outline"
                                className="w-full flex items-center gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <Upload className="h-4 w-4" />
                                {screenshotFile ? 'Change Screenshot' : 'Upload Screenshot'}
                            </Button>
                        </div>

                        {screenshotPreview && (
                            <div className="relative group border-2 border-dashed border-border rounded-lg p-2">
                                <Image
                                    src={screenshotPreview}
                                    alt="Screenshot Preview"
                                    width={400}
                                    height={400}
                                    className="rounded-md w-full h-auto object-contain"
                                />
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="secondary" onClick={() => setIsEditing(true)} disabled={isLoading}>
                                        <FilePenLine className="h-5 w-5"/>
                                     </Button>
                                      <Button size="icon" variant="destructive" onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }} disabled={isLoading}>
                                        <Trash2 className="h-5 w-5"/>
                                     </Button>
                                </div>
                            </div>
                        )}
                        
                        {isEditing && (
                            <div className="space-y-2 p-3 bg-secondary rounded-lg">
                                <Label htmlFor="edit-prompt">AI Edit Prompt</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        id="edit-prompt"
                                        placeholder='e.g., "blur my name"'
                                        value={editPrompt}
                                        onChange={(e) => setEditPrompt(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Button onClick={handleEditScreenshot} disabled={isLoading || !editPrompt}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Describe how you want the AI to edit the image.</p>
                            </div>
                        )}

                    </CardContent>
                    <CardFooter>
                        <Button
                            className="w-full"
                            onClick={handleVerify}
                            disabled={isLoading || !utrNumber || !screenshotFile}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="mr-2 h-4 w-4" />
                            )}
                            Verify & Get Key
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}

