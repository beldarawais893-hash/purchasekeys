'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { KeyRound, Lock, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const router = useRouter();

  return (
    <header className="bg-card text-card-foreground p-4 flex justify-between items-center border-b border-border">
      <div className="flex items-center gap-2">
        <KeyRound className="text-primary h-6 w-6" />
        <h1 className="text-xl font-bold">Purchase Key</h1>
      </div>
      {/* Admin Menu Removed */}
    </header>
  );
}
