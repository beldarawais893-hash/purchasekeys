'use client';

import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AiRecommender() {
  return (
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
  );
}
