
'use client';
import { usePaymentParams } from './use-payment-params';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Banknote,
  Clipboard,
  ClipboardCheck,
  FileImage,
  Loader2,
  Send,
  Sparkles,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import {
  getAiRecommendation,
} from '@/app/actions';

export default function PaymentPageContent() {
  const router = useRouter();
  const { plan, price } = usePaymentParams();
  const { toast } = useToast();

  const [utr, setUtr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScreenshotProcessing, setScreenshotProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCopied, setIsCopied] = useState(false);

  const upiId = 'mrdaxx@paytm';

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    toast({
      title: 'Copied!',
      description: 'UPI ID has been copied to your clipboard.',
    });
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation for image type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (e.g., JPG, PNG).',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!utr.trim()) {
      toast({
        title: 'UTR Required',
        description: 'Please enter the UTR number from your payment.',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedFile || !previewUrl) {
      toast({
        title: 'Screenshot Required',
        description: 'Please upload a screenshot of your payment.',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    toast({
      title: 'Verifying Payment...',
      description: 'Our AI is checking your payment details. Please wait.',
    });

    try {
      // This is a placeholder for the actual AI verification
      // Simulating a delay for the AI to process
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      router.push(
        `/success?plan=${plan}&price=${price}&utr=${utr}`
      );
    } catch (error: any) {
      console.error('Verification failed:', error);
      toast({
        title: 'Verification Failed',
        description:
          error.message ||
          'The AI could not verify your payment. Please double-check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-2xl font-bold text-foreground font-headline">
          Complete Your Purchase
        </h1>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Left Side: Payment Instructions & QR */}
          <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote />
                Payment Method
              </CardTitle>
              <CardDescription>
                Scan the QR code or use the UPI ID to pay{' '}
                <span className="font-bold text-primary">₹{price}</span> for the{' '}
                <span className="font-bold text-primary">{plan}</span> plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg shadow-md">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId}%26pn=Purchase%26am=${price}`}
                  alt="UPI QR Code"
                  width={200}
                  height={200}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Or pay to this UPI ID:
              </p>
              <div className="flex w-full max-w-sm items-center space-x-2 rounded-lg border border-dashed border-primary/50 bg-secondary/50 p-3">
                <p className="flex-grow select-all break-all font-mono text-base font-bold text-primary">
                  {upiId}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy UPI ID"
                >
                  {isCopied ? (
                    <ClipboardCheck className="h-5 w-5 text-green-400" />
                  ) : (
                    <Clipboard className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Side: UTR and Screenshot Upload */}
          <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles />
                Verify with AI
              </CardTitle>
              <CardDescription>
                Enter your payment UTR/UPI Ref ID and upload a screenshot to get
                your key instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="utr"
                  type="text"
                  placeholder="Enter 12-digit UTR / UPI Ref ID"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  className="text-base"
                  maxLength={12}
                />
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScreenshotProcessing}
                >
                  {isScreenshotProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload Payment Screenshot
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>

              {previewUrl && (
                <div className="relative group border-2 border-dashed border-primary/50 rounded-lg p-2">
                  <Image
                    src={previewUrl}
                    alt="Payment screenshot preview"
                    width={300}
                    height={300}
                    className="w-full h-auto rounded-md object-contain max-h-48"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-bold">
                      {selectedFile?.name}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleVerify}
                disabled={isVerifying || !utr || !selectedFile}
                className="w-full bg-primary/90 hover:bg-primary"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Verify & Get Key
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
