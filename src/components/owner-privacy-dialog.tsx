'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const plans = [
  { duration: '1 DAY', price: '19 Rs' },
  { duration: '3 DAY', price: '350 Rs' },
  { duration: '7 DAY', price: '500 Rs' },
  { duration: '15 DAY', price: '720 Rs' },
  { duration: '1 MONTH', price: '1000 Rs' },
];

type Key = {
  id: string;
  value: string;
  plan: string;
  status: 'available' | 'claimed';
};

type OwnerPrivacyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OwnerPrivacyDialog({ open, onOpenChange }: OwnerPrivacyDialogProps) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [newKey, setNewKey] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const { toast } = useToast();

  const handleAddKey = () => {
    if (!newKey.trim() || !selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please enter a key and select a plan.',
        variant: 'destructive',
      });
      return;
    }

    const keyToAdd: Key = {
      id: crypto.randomUUID(),
      value: newKey.trim(),
      plan: selectedPlan,
      status: 'available',
    };

    setKeys((prevKeys) => [...prevKeys, keyToAdd]);
    setNewKey('');
    setSelectedPlan('');
    toast({
      title: 'Success',
      description: 'Key added successfully.',
    });
  };

  const availableKeys = keys.filter((key) => key.status === 'available').length;
  const claimedKeys = keys.filter((key) => key.status === 'claimed').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Owner Privacy</DialogTitle>
          <DialogDescription>
            Add and manage keys for your subscription plans.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-key" className="text-right">
              New Key
            </Label>
            <Input
              id="new-key"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter new key"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">
              Plan
            </Label>
            <Select onValueChange={setSelectedPlan} value={selectedPlan}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.duration} value={plan.duration}>
                    {plan.duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-around mb-4">
            <div className='text-center'>
                <p className='font-bold text-lg'>{availableKeys}</p>
                <p className='text-sm text-muted-foreground'>Available Keys</p>
            </div>
            <div className='text-center'>
                <p className='font-bold text-lg'>{claimedKeys}</p>
                <p className='text-sm text-muted-foreground'>Claimed Keys</p>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddKey}>Add Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
