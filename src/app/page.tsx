import { AiRecommender } from '@/components/ai-recommender';
import { SubscriptionPlans } from '@/components/subscription-plans';

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 font-headline">
            Subscription Selector
          </h1>
          <p className="text-lg text-muted-foreground">
            Find the perfect plan for your streaming needs.
          </p>
        </header>

        <section id="plans">
          <h2 className="text-3xl font-bold text-center mb-8">Our Plans</h2>
          <SubscriptionPlans />
        </section>

        <section id="ai-recommender" className="mt-20">
          <AiRecommender />
        </section>
      </main>
    </div>
  );
}
