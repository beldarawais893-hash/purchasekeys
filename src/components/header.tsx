'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { KeyRound, Lock, Menu } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card text-card-foreground p-4 flex justify-between items-center border-b border-border">
      <div className="flex items-center gap-2">
        <KeyRound className="text-primary h-6 w-6" />
        <h1 className="text-xl font-bold">Purchase Key</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Lock className="mr-2 h-4 w-4" />
            <span>Owner privicy</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
