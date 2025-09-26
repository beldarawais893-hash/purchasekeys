'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionPlan } from '@/lib/types';

const plans: SubscriptionPlan[] = [
  { id: 1, duration: '1 Day', price: 200, currency: 'RS' },
  { id: 2, duration: '3 Days', price: 350, currency: 'RS' },
  { id: 3, duration: '7 Days', price: 500, currency: 'RS' },
  { id: 4, duration: '15 Days', price: 720, currency: 'RS' },
  { id: 5, duration: '1 Month', price: 1000, currency: 'RS' },
];

export function SubscriptionPlans() {
  const { toast } = useToast();

  const handlePurchase = (plan: SubscriptionPlan) => {
    toast({
      title: 'Purchase Successful!',
      description: `You have purchased the ${plan.duration} plan.`,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className="flex flex-col text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        >
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {plan.duration}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-5xl font-bold text-primary">
              {plan.price}
              <span className="text-xl font-medium text-muted-foreground ml-1">
                {plan.currency}
              </span>
            </p>
          </CardContent>
          <CardFooter className="flex-col">
            <Button
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => handlePurchase(plan)}
            >
              Buy
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
