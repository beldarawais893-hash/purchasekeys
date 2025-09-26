
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

const plans = [
  { id: 1, duration: '1 DAY', price: '200 Rs' },
  { id: 2, duration: '3 DAY', price: '350 Rs' },
  { id: 3, duration: '7 DAY', price: '500 Rs' },
  { id: 4, duration: '15 DAY', price: '720 Rs' },
  { id: 5, duration: '1 MONTH', price: '1000 Rs' },
];

export function PurchaseSchedule() {
  const { toast } = useToast();

  const handlePurchase = (plan: { duration: string }) => {
    toast({
      title: 'Purchase Successful!',
      description: `You have purchased the ${plan.duration} plan.`,
    });
  };

  return (
    <>
    <div className="flex justify-end items-center mb-4">
       <div className="relative w-full max-w-xs">
         <Input
          type="text"
          placeholder="Find Your Key"
          className="bg-transparent pr-10"
        />
        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
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
