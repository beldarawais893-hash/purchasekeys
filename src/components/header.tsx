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
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState('');

  const handleAdminAccess = () => {
    if (password === '3131') {
      router.push('/admin');
      setIsPasswordDialogOpen(false);
      setPassword('');
    } else {
      toast({
        title: 'Incorrect Password',
        description: 'The password you entered is incorrect.',
        variant: 'destructive',
      });
      setPassword('');
    }
  };

  return (
    <>
      <header className="bg-card text-card-foreground p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2">
          <KeyRound className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold">Army Owner Keys</h1>
        </div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Owner Privacy</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
            <DialogDescription>
              Please enter the password to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminAccess()}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAdminAccess}>Enter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
