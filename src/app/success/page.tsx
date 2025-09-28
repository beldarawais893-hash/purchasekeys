
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm animate-border-glow text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold text-foreground">
            Submission Received!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Thank you for your submission. Your payment is being verified. You
            will receive your access key on Telegram once the verification is
d           complete.
          </p>
          <Button
            onClick={() => router.push('/home')}
            className="w-full bg-primary/90 hover:bg-primary"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
