
'use client';

import {
  ArrowLeft,
  KeyRound,
  Wallet,
  History,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trash2,
  MoreVertical,
  List,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

type Key = {
  id: string;
  value: string;
  plan: string;
  price: number;
  createdAt: string; // ISO string
  claimedAt?: string; // ISO string
  status: 'available' | 'claimed';
};

const plans = [
  { duration: '1 Day', price: 200 },
  { duration: '3 Day', price: 350 },
  { duration: '7 Day', price: 500 },
  { duration: '15 Day', price: 720 },
  { duration: '1 Month', price: 1000 },
];


// Helper function to check if a key is expired
const isKeyExpired = (key: Key): boolean => {
  if (key.status !== 'claimed' || !key.claimedAt) {
    return false;
  }

  const claimedDate = new Date(key.claimedAt);
  const expiryDate = new Date(claimedDate);

  if (key.plan.includes('Day')) {
    const days = parseInt(key.plan.split(' ')[0], 10);
    expiryDate.setDate(claimedDate.getDate() + days);
  } else if (key.plan.includes('Month')) {
    const months = parseInt(key.plan.split(' ')[0], 10);
    expiryDate.setMonth(claimedDate.getMonth() + months);
  }

  return new Date() > expiryDate;
};


export default function AdminPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<Key[]>([]);

  useEffect(() => {
    const storedKeys: Key[] = JSON.parse(localStorage.getItem('keys') || '[]');
    setKeys(storedKeys);
  }, []);

  const availableKeys = useMemo(() => keys.filter(k => k.status === 'available' && !isKeyExpired(k)), [keys]);
  const claimedKeys = useMemo(() => keys.filter(k => k.status === 'claimed' && !isKeyExpired(k)), [keys]);
  const expiredKeys = useMemo(() => keys.filter(k => isKeyExpired(k)), [keys]);


  // Balance Page Statistics
  const totalBalance = useMemo(() => claimedKeys.reduce((acc, key) => acc + (key.price || 0), 0), [claimedKeys]);
  const totalKeys = keys.length;
  const availableKeysCount = availableKeys.length;
  const availablePercentage = totalKeys > 0 ? (availableKeysCount / totalKeys) * 100 : 0;
  const activeClaimedCount = claimedKeys.length;
  const expiredKeysCount = expiredKeys.length;

  const keysByPlan = useMemo(() => {
    return plans.map(plan => {
      const total = keys.filter(k => k.plan === plan.duration).length;
      const available = availableKeys.filter(k => k.plan === plan.duration).length;
      const claimed = keys.filter(k => k.plan === plan.duration && k.status === 'claimed').length;
      return { ...plan, total, available, claimed };
    });
  }, [keys, availableKeys]);


  const handleAddNewKey = () => {
    // This is a simplified example. A real implementation would use a form.
    const plan = plans[Math.floor(Math.random() * plans.length)]; // Pick a random plan
    const newKey: Key = {
      id: `key_${Date.now()}`,
      value: `NEW-KEY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      plan: plan.duration,
      price: plan.price,
      createdAt: new Date().toISOString(),
      status: 'available',
    };

    const updatedKeys = [...keys, newKey];
    setKeys(updatedKeys);
    localStorage.setItem('keys', JSON.stringify(updatedKeys));
  };

  const handleDeleteKey = (keyId: string) => {
    const updatedKeys = keys.filter(k => k.id !== keyId);
    setKeys(updatedKeys);
    localStorage.setItem('keys', JSON.stringify(updatedKeys));
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-xl font-semibold">Purchase Keys</h1>
        <div className="ml-auto">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <span>Settings</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem>
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-6">
        <Tabs defaultValue="keys" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="keys">
              <KeyRound className="mr-2" /> Keys
            </TabsTrigger>
            <TabsTrigger value="balance">
              <Wallet className="mr-2" /> Balance
            </TabsTrigger>
            <TabsTrigger value="expired">
              <History className="mr-2" /> Expired Keys
            </TabsTrigger>
          </TabsList>
          
          {/* Keys Tab Content */}
          <TabsContent value="keys">
            <Card className="mt-4 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Key Management</CardTitle>
                        <CardDescription>
                            Add, view, and manage keys here. Data is saved locally.
                        </CardDescription>
                    </div>
                    <div className='flex gap-2'>
                        <Button size="sm" className='bg-primary/90 hover:bg-primary' onClick={handleAddNewKey}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Key
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => window.location.reload()}>
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="available">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="available">
                      <CheckCircle2 className="mr-2 text-green-500" /> Available Keys
                    </TabsTrigger>
                    <TabsTrigger value="claimed">
                      <XCircle className="mr-2 text-yellow-500" /> Claimed Keys
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="available" className="mt-4">
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {availableKeys.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell><Badge variant="secondary">{k.value}</Badge></TableCell>
                                        <TableCell>{k.plan}</TableCell>
                                        <TableCell>{new Date(k.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(k.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                  </TabsContent>
                  <TabsContent value="claimed" className="mt-4">
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Claimed At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {claimedKeys.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell><Badge variant="secondary">{k.value}</Badge></TableCell>
                                        <TableCell>{k.plan}</TableCell>
                                        <TableCell>{k.claimedAt ? new Date(k.claimedAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(k.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Balance Tab Content */}
          <TabsContent value="balance">
            <div className="mt-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Balance Information</CardTitle>
                        <CardDescription>View payment amounts and key statistics.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card className="p-4">
                           <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                             <Wallet className="h-5 w-5 text-muted-foreground"/>
                           </div>
                           <p className="text-2xl font-bold flex items-center">
                            <IndianRupee className="h-5 w-5 mr-1" />
                            {totalBalance.toLocaleString()}
                            </p>
                           <p className="text-xs text-muted-foreground">From all claimed keys</p>
                        </Card>
                         <Card className="p-4">
                           <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                             <List className="h-5 w-5 text-muted-foreground"/>
                           </div>
                           <p className="text-2xl font-bold">{totalKeys}</p>
                           <p className="text-xs text-muted-foreground">All generated keys</p>
                        </Card>
                         <Card className="p-4">
                           <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-medium text-muted-foreground">Available Keys</p>
                             <CheckCircle2 className="h-5 w-5 text-green-500"/>
                           </div>
                           <p className="text-2xl font-bold">{availableKeysCount}</p>
                           <Progress value={availablePercentage} className="h-2 mt-1" />
                           <p className="text-xs text-muted-foreground mt-1">{availablePercentage.toFixed(0)}% of total</p>
                        </Card>
                         <Card className="p-4">
                           <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-medium text-muted-foreground">Active Claimed</p>
                             <XCircle className="h-5 w-5 text-yellow-500"/>
                           </div>
                           <p className="text-2xl font-bold">{activeClaimedCount}</p>
                           <p className="text-xs text-muted-foreground">Currently active keys</p>
                        </Card>
                         <Card className="p-4">
                           <div className="flex justify-between items-center mb-2">
                             <p className="text-sm font-medium text-muted-foreground">Expired Keys</p>
                             <Clock className="h-5 w-5 text-red-500"/>
                           </div>
                           <p className="text-2xl font-bold">{expiredKeysCount}</p>
                           <p className="text-xs text-muted-foreground">Total expired keys</p>
                        </Card>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Keys by Plan</CardTitle>
                        <CardDescription>Breakdown of keys for each subscription plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Total Keys</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead>Claimed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keysByPlan.map(plan => (
                                        <TableRow key={plan.duration}>
                                            <TableCell>{plan.duration}</TableCell>
                                            <TableCell>{plan.price}</TableCell>
                                            <TableCell>{plan.total}</TableCell>
                                            <TableCell className="text-green-500 font-semibold">{plan.available}</TableCell>
                                            <TableCell className="text-red-500 font-semibold">{plan.claimed}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="expired">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Expired Keys</CardTitle>
                    <CardDescription>View all keys that have expired.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Key</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Claimed At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {expiredKeys.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell><Badge variant="destructive">{k.value}</Badge></TableCell>
                                        <TableCell>{k.plan}</TableCell>
                                        <TableCell>{k.claimedAt ? new Date(k.claimedAt).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(k.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {expiredKeys.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">No expired keys found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    