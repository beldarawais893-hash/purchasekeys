import { AppHeader } from '@/components/header';
import { PurchaseSchedule } from '@/components/purchase-schedule';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 md:py-12 flex-grow">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline">
            Purchase Schedule
          </h1>
        </header>

        <section id="purchase-schedule" className="mb-12">
          <PurchaseSchedule />
        </section>

        <section id="contact-owner">
          <Card className="max-w-md mx-auto bg-card">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold">Contact Owner</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4 pt-6">
              <Button variant="ghost" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Kaalbhairavmodzowner
              </Button>
              <Button variant="ghost" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                ImpalerVLAED
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
