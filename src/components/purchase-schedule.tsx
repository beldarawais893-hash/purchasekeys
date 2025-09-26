
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

const plans = [
  { id: 1, duration: '1 DAY', price: '19 Rs' },
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
  );
}
