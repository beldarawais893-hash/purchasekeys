
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

  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [viewingHabits, setViewingHabits] = useState('');
  const [preferences, setPreferences] = useState('');
  const [recommendation, setRecommendation] = useState<{
    plan: string;
    reason: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = (plan: Omit<SubscriptionPlan, 'id' | 'currency'>) => {
    router.push(`/payment?plan=${plan.duration}&price=${plan.price}`);
  };

  const handleGetRecommendation = async () => {
    if (!viewingHabits || !preferences) {
      toast({
        title: 'Missing Information',
        description: 'Please tell us about your viewing habits and preferences.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setRecommendation(null);
    try {
      const result = await getAiRecommendation({ viewingHabits, preferences });
      setRecommendation({
        plan: result.recommendedPlan,
        reason: result.reasoning,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'AI Error',
        description:
          'Could not get a recommendation at this time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-3xl font-bold">
          Choose Your Plan
        </CardTitle>
        <CardDescription className="text-center">
          Select a subscription that fits your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={isAiHelperOpen} onOpenChange={setIsAiHelperOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              Need help choosing? Get an AI recommendation!
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  isAiHelperOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-4 pb-4 border rounded-lg mb-6 animate-accordion-down">
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="viewing-habits" className="flex items-center gap-2">
                  <MessageSquareHeart className="h-4 w-4" />
                  Your Viewing Habits
                </Label>
                <Textarea
                  id="viewing-habits"
                  placeholder="e.g., 'I watch movies almost every day for a few hours.'"
                  value={viewingHabits}
                  onChange={(e) => setViewingHabits(e.target.value)}
                  className="bg-background/70"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferences">Your Preferences</Label>
                <Textarea
                  id="preferences"
                  placeholder="e.g., 'I want the most cost-effective plan for long-term use.'"
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                   className="bg-background/70"
                />
              </div>
            </div>
            <Button
              onClick={handleGetRecommendation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Thinking...' : 'Get Suggestion'}
            </Button>
            {recommendation && (
              <Alert className="mt-4 animate-fade-in bg-primary/10 border-primary/50">
                <Sparkles className="h-4 w-4 text-primary" />
                <AlertTitle className="font-bold text-primary">
                  AI Recommendation
                </AlertTitle>
                <AlertDescription>
                  <p className="font-semibold">
                    Based on your input, we suggest the{' '}
                    <Badge variant="default">{recommendation.plan}</Badge>.
                  </p>
                  <p className="mt-2 text-sm">{recommendation.reason}</p>
                </AlertDescription>
              </Alert>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.duration}
              className="group flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:shadow-primary/20"
            >
              <CardHeader>
                <CardTitle className="text-center text-xl">
                  {plan.duration}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col items-center justify-center">
                <p className="text-4xl font-bold text-primary">
                  {plan.price}
                  <span className="text-lg text-muted-foreground"> Rs</span>
                </p>
              </CardContent>
              <div className="p-4">
                <Button
                  className="w-full transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/50"
                  variant="outline"
                  onClick={() => handlePay(plan)}
                >
                  Pay Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
