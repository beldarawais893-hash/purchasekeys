'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  PlusCircle,
  Trash2,
  ArrowLeft,
  KeyRound,
  Wallet,
  CheckCircle,
  XCircle,
  Boxes,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const plans = [
  { duration: '1 Day', price: '200 Rs' },
  { duration: '3 Day', price: '350 Rs' },
  { duration: '7 Day', price: '500 Rs' },
  { duration: '15 Day', price: '720 Rs' },
  { duration: '1 Month', price: '1000 Rs' },
];

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  status: 'available' | 'claimed';
};

const initialKeys: Key[] = [
  {
    id: '1',
    value: '24HxMahakaalx1xzvasT8Be',
    plan: '1 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '2',
    value: '24HxMahakaalx1gMKbm1jN',
    plan: '1 Day',
    createdAt: '25/09/2025',
    status: 'claimed',
  },
  {
    id: '3',
    value: '24HxMahakaalx1DJ20UzOB',
    plan: '1 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '4',
    value: '24HxMahakaalx1Cn5eREDI',
    plan: '1 Day',
    createdAt: '25/09/2025',
    status: 'claimed',
  },
  {
    id: '5',
    value: '3DAYxMahakaalxRANDOM1',
    plan: '3 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '6',
    value: '3DAYxMahakaalxRANDOM2',
    plan: '3 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '7',
    value: '3DAYxMahakaalxRANDOM3',
    plan: '3 Day',
    createdAt: '25/09/2025',
    status: 'claimed',
  },
  {
    id: '8',
    value: '3DAYxMahakaalxRANDOM4',
    plan: '3 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '9',
    value: '3DAYxMahakaalxRANDOM5',
    plan: '3 Day',
    createdAt: '25/09/2025',
    status: 'available',
  },
  {
    id: '10',
    value: '7DAYxMahakaalxtBzbH4Ys',
    plan: '7 Day',
    createdAt: '25/09/2025',
    status: 'claimed',
  },
];

export default function AdminPage() {
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activeTab, setActiveTab] = useState('keys');
  const { toast } = useToast();
  const router = useRouter();

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
      createdAt: new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date()),
      status: 'available',
    };

    setKeys((prevKeys) => [keyToAdd, ...prevKeys]);
    setNewKey('');
    setSelectedPlan('');
    setIsAddKeyDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Key added successfully.',
    });
  };

  const handleDeleteKey = (keyId: string) => {
    setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyId));
    toast({
      title: 'Success',
      description: 'Key deleted successfully.',
    });
  };
  
  const availableKeys = keys.filter(key => key.status === 'available');
  const claimedKeys = keys.filter(key => key.status === 'claimed');

  const totalKeys = keys.length;

  const keysByPlan = plans.map(plan => {
    const planKeys = keys.filter(key => key.plan === plan.duration);
    const available = planKeys.filter(k => k.status === 'available').length;
    const claimed = planKeys.filter(k => k.status === 'claimed').length;
    return {
      name: plan.duration,
      total: planKeys.length,
      available,
      claimed,
      price: plan.price
    };
  });

  const totalBalance = keysByPlan.reduce((acc, plan) => {
    return acc + (plan.total * parseInt(plan.price));
  }, 0);


  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card text-card-foreground p-4 flex justify-between items-center border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <KeyRound className="text-primary h-6 w-6" />
          <h1 className="text-xl font-bold">Purchase Key</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={activeTab === 'keys' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('keys')}>
            <KeyRound className="mr-2" />
            Keys
          </Button>
          <Button variant={activeTab === 'balance' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('balance')}>
            <Wallet className="mr-2" />
            Balance
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'keys' && (
          <>
            <Card className="bg-card border-none mb-8">
              <CardHeader>
                <CardTitle>Key Management</CardTitle>
                <CardDescription>Add, view, and manage keys here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-accent" onClick={() => setIsAddKeyDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Key
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card border-none mb-8">
              <CardHeader>
                <CardTitle>Available Keys</CardTitle>
                <CardDescription>
                  These keys are available for users to purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-foreground font-semibold">Key</TableHead>
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Created At</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableKeys.map((key) => (
                      <TableRow key={key.id} className="border-b border-border/20">
                        <TableCell>
                          <Badge variant="outline" className="bg-green-800/20 border-green-500 text-green-400">
                            {key.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.plan}</TableCell>
                        <TableCell>{key.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(key.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card border-none">
              <CardHeader>
                <CardTitle>Claimed Keys</CardTitle>
                <CardDescription>
                  These keys have already been used.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-foreground font-semibold">Key</TableHead>
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Created At</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claimedKeys.map((key) => (
                      <TableRow key={key.id} className="border-b border-border/20">
                        <TableCell>
                          <Badge variant="outline" className="bg-red-800/20 border-red-500 text-red-400">
                            {key.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.plan}</TableCell>
                        <TableCell>{key.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(key.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
        {activeTab === 'balance' && (
          <div className="space-y-8">
            <Card className="bg-card border-none">
              <CardHeader>
                <CardTitle>Balance Information</CardTitle>
                <CardDescription>
                  View payment amounts and available keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-secondary/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalKeys}</div>
                      <p className="text-xs text-muted-foreground">All generated keys</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Keys</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{availableKeys.length}</div>
                       <p className="text-xs text-muted-foreground">{((availableKeys.length / totalKeys) * 100).toFixed(0) || 0}% available</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50 border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Claimed Keys</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{claimedKeys.length}</div>
                      <p className="text-xs text-muted-foreground">{((claimedKeys.length / totalKeys) * 100).toFixed(0) || 0}% claimed</p>
                    </CardContent>
                  </Card>
              </CardContent>
            </Card>

            <Card className="bg-card border-none">
              <CardHeader>
                <CardTitle>Keys by Plan</CardTitle>
                <CardDescription>Breakdown of keys for each subscription plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50">
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Price</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Total Keys</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Available</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Claimed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keysByPlan.map((plan) => (
                      <TableRow key={plan.name} className="border-b border-border/20">
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.price}</TableCell>
                        <TableCell className="text-center">{plan.total}</TableCell>
                        <TableCell className="text-center text-green-400">{plan.available}</TableCell>
                        <TableCell className="text-center text-red-400">{plan.claimed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Key</DialogTitle>
            <DialogDescription>
              Enter the key details and select a plan.
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
          <DialogFooter>
            <Button onClick={handleAddKey}>Add Key</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
