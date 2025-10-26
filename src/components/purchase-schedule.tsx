
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  ChevronDown,
  MessageSquareHeart,
  CalendarDays,
  IndianRupee,
  ShoppingCart,
} from 'lucide-react';
import { getAiRecommendation } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionPlan } from '@/lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const plans: Omit<SubscriptionPlan, 'id' | 'currency'>[] = [
  { duration: '1 Day', price: 150 },
  { duration: '3 Day', price: 300 },
  { duration: '7 Day', price: 400 },
  { duration: '15 Day', price: 500 },
  { duration: '1 Month', price: 700 },
  { duration: '2 Month', price: 1200 },
];

export function PurchaseSchedule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mod = searchParams.get('mod');

  const handlePay = (plan: Omit<SubscriptionPlan, 'id' | 'currency'>) => {
     const params = new URLSearchParams();
     if (mod) {
       params.append('mod', mod);
     }
     params.append('plan', plan.duration);
     params.append('price', plan.price.toString());
     router.push(`/payment?${params.toString()}`);
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-border-glow">
       <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Choose Your Plan</CardTitle>
          <CardDescription className="text-center">Select a subscription plan to activate your mod.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-lg">
          <div className="grid grid-cols-3 gap-2 md:gap-4 bg-muted/30 p-3 md:p-4 text-xs md:text-sm font-semibold text-primary">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
              <span>DAYS</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 md:h-5 md:w-5" />
              <span>PRICE</span>
            </div>
             <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              <span>PURCHASE</span>
            </div>
          </div>
          <div className="flex flex-col">
            {plans.map((plan, index) => (
              <div
                key={plan.duration}
                className={`grid grid-cols-3 items-center gap-2 md:gap-4 p-3 md:p-4 text-sm md:text-base ${
                  index < plans.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="font-medium">{plan.duration}</div>
                <div>{plan.price} Rs</div>
                <Button onClick={() => handlePay(plan)} size="sm" className="bg-primary/90 hover:bg-primary text-xs md:text-sm">
                  Buy Now <ShoppingCart className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

    

    
