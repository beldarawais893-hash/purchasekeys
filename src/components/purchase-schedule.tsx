
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowRight,
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
  { duration: '1 Day', price: 200 },
  { duration: '3 Day', price: 350 },
  { duration: '7 Day', price: 500 },
  { duration: '15 Day', price: 720 },
  { duration: '1 Month', price: 900 },
  { duration: '2 Month', price: 1400 },
];

export function PurchaseSchedule() {
  const router = useRouter();
  const { toast } = useToast();

  const handlePay = (plan: Omit<SubscriptionPlan, 'id' | 'currency'>) => {
    // router.push(`/payment?plan=${plan.duration}&price=${plan.price}`);
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm animate-border-glow">
      <CardContent className="p-0">
        <div className="overflow-hidden rounded-lg">
          <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 font-semibold text-primary">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              <span>DAYS</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              <span>PRICE</span>
            </div>
          </div>
          <div className="flex flex-col">
            {plans.map((plan, index) => (
              <div
                key={plan.duration}
                className={`grid grid-cols-2 items-center gap-4 p-4 ${
                  index < plans.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="font-medium">{plan.duration}</div>
                <div>{plan.price} Rs</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
