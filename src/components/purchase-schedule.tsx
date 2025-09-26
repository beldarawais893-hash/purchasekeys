
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
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  claimedAt?: string;
  status: 'available' | 'claimed';
};

const plans = [
  { id: 1, duration: '1 Day', price: '200 Rs' },
  { id: 2, duration: '3 Day', price: '350 Rs' },
  { id: 3, duration: '7 Day', price: '500 Rs' },
  { id: 4, duration: '15 Day', price: '720 Rs' },
  { id: 5, duration: '1 Month', price: '1000 Rs' },
];

export function PurchaseSchedule() {
  const { toast } = useToast();
  const [searchKey, setSearchKey] = useState('');

  const handlePurchase = (plan: { duration: string }) => {
    try {
      const storedKeys = localStorage.getItem('appKeys');
      if (!storedKeys) {
        toast({ title: 'Error', description: 'No keys available.', variant: 'destructive' });
        return;
      }
      
      let keys: Key[] = JSON.parse(storedKeys);
      const availableKeyIndex = keys.findIndex(k => k.plan === plan.duration && k.status === 'available');

      if (availableKeyIndex === -1) {
        toast({ title: 'Sold Out!', description: `Sorry, all keys for the ${plan.duration} plan are currently sold out.`, variant: 'destructive' });
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
        description: `Your key is: ${keyToClaim.value}`,
      });

    } catch (error) {
      console.error("Failed to process purchase", error);
      toast({ title: 'Error', description: 'Could not process the purchase.', variant: 'destructive' });
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
                    onClick={() => handlePurchase(plan)}
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
    </>
  );
}

    