'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, Loader2 } from 'lucide-react';

import { getAiRecommendation } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { RecommendSubscriptionPlanOutput } from '@/ai/flows/recommend-subscription-plan';

const formSchema = z.object({
  viewingHabits: z
    .string()
    .min(10, 'Please describe your viewing habits in at least 10 characters.'),
  preferences: z
    .string()
    .min(10, 'Please describe your preferences in at least 10 characters.'),
});

export function AiRecommender() {
  const [recommendation, setRecommendation] =
    useState<RecommendSubscriptionPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      viewingHabits: '',
      preferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setRecommendation(null);
    try {
      const result = await getAiRecommendation(values);
      setRecommendation(result);
      setIsDialogOpen(true);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
            <Lightbulb className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold mt-4">
            AI Plan Recommender
          </CardTitle>
          <CardDescription>
            Not sure which plan to choose? Let our AI help you decide!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="viewingHabits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Viewing Habits</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I watch movies every weekend, about 2-3 hours a day. I mostly watch new releases."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., I'm on a budget, looking for the best value for money. I don't need 4K streaming."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <p className="text-sm font-medium text-destructive">{error}</p>
              )}
              <CardFooter className="p-0 pt-4">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Recommendation...
                    </>
                  ) : (
                    'Get AI Recommendation'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Our Recommendation For You
            </DialogTitle>
            <DialogDescription>
              Based on your input, we suggest the following plan.
            </DialogDescription>
          </DialogHeader>
          {recommendation && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-primary">
                  {recommendation.recommendedPlan}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
