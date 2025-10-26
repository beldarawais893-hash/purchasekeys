
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
  FilePlus,
  Loader2,
  ShieldAlert,
  ChevronDown,
  Filter,
  Cpu,
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { getKeys, saveKeys } from '@/app/actions';
import { Checkbox } from '@/components/ui/checkbox';
import type { Key } from '@/lib/types';


const plans = [
  { duration: '1 Day', price: 150 },
  { duration: '3 Day', price: 300 },
  { duration: '7 Day', price: 400 },
  { duration: '15 Day', price: 500 },
  { duration: '1 Month', price: 700 },
  { duration: '2 Month', price: 1200 },
];

const mods = [
  { name: 'Safe loader', status: 'available' },
  { name: 'Infinite mod', status: 'available' },
  { name: 'Ignis mod', status: 'available' },
  { name: 'Monster mod', status: 'available' },
  { name: 'Kristal mod', status: 'coming_soon' },
];


// Helper function to check if a key is expired
const isKeyExpired = (key: Key): boolean => {
  if (key.status !== 'claimed' || !key.claimedAt) {
    return false;
  }

  const claimedDate = new Date(key.claimedAt);
  const expiryDate = new Date(claimedDate);

  const [value, unit] = key.plan.split(' ');
  const amount = parseInt(value, 10);

  if (unit.toLowerCase().includes('day')) {
    expiryDate.setDate(claimedDate.getDate() + amount);
  } else if (unit.toLowerCase().includes('month')) {
    expiryDate.setMonth(claimedDate.getMonth() + amount);
  }

  return new Date() > expiryDate;
};

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [keys, setKeys] = useState<Key[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<Key | null>(null);
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState(false);
  const [selectedMod, setSelectedMod] = useState('All Mods');
  
  // States for the 'Add New Key' form
  const [newKeyMod, setNewKeyMod] = useState('');
  const [newKeyPlan, setNewKeyPlan] = useState(plans[0].duration);
  const [newKeyValues, setNewKeyValues] = useState('');

  const fetchKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedKeys = await getKeys();
      setKeys(storedKeys);
    } catch (error) {
      console.error("Failed to fetch keys from KV store:", error);
      let description = 'Could not load keys from the online database.';
       if (error instanceof Error && (error.message.includes('KV_REST_API_URL') || error.message.includes('KV_REST_API_TOKEN') || error.message.includes('Vercel KV'))) {
        description = 'Connection Error: Could not connect to Vercel KV. Please go to your Vercel Project Settings > Environment Variables and add your KV credentials. Then, redeploy your project.';
      } else if (error instanceof Error && error.message.includes('WRONGTYPE')) {
         description = 'Database Error: The data format in Vercel KV is incorrect. The app tried to fix it. Please refresh.';
      }
      toast({
        title: 'Error Loading Keys',
        description: description,
        variant: 'destructive',
        duration: 15000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const filteredKeys = useMemo(() => {
    if (selectedMod === 'All Mods') {
      return keys;
    }
    return keys.filter(k => k.mod === selectedMod);
  }, [keys, selectedMod]);

  const availableKeys = useMemo(() => {
    const planOrder = plans.reduce((acc, plan, index) => {
      acc[plan.duration] = index;
      return acc;
    }, {} as Record<string, number>);

    return filteredKeys
      .filter((k) => k.status === 'available' && !isKeyExpired(k))
      .sort((a, b) => {
        const orderA = planOrder[a.plan] ?? Infinity;
        const orderB = planOrder[b.plan] ?? Infinity;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // If plans are the same, sort by creation date descending (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [filteredKeys]);

  const claimedKeys = useMemo(
    () => filteredKeys.filter((k) => k.status === 'claimed' && !isKeyExpired(k)),
    [filteredKeys]
  );
  const expiredKeys = useMemo(() => filteredKeys.filter((k) => isKeyExpired(k)), [
    filteredKeys,
  ]);

  // Balance Page Statistics
  const totalBalance = useMemo(
    () => claimedKeys.reduce((acc, key) => acc + (key.price || 0), 0),
    [claimedKeys]
  );
  const totalKeys = filteredKeys.length;
  const availableKeysCount = availableKeys.length;
  const availablePercentage =
    totalKeys > 0 ? (availableKeysCount / totalKeys) * 100 : 0;
  const activeClaimedCount = claimedKeys.length;
  const expiredKeysCount = expiredKeys.length;

  const keysByPlan = useMemo(() => {
    return plans.map((plan) => {
      const total = filteredKeys.filter((k) => k.plan === plan.duration).length;
      const available = availableKeys.filter(
        (k) => k.plan === plan.duration
      ).length;
      const claimed = filteredKeys.filter(
        (k) => k.plan === plan.duration && k.status === 'claimed'
      ).length;
      return { ...plan, total, available, claimed };
    });
  }, [filteredKeys, availableKeys]);

  const salesByMod = useMemo(() => {
    if (selectedMod !== 'All Mods') {
      return [];
    }
    const sales = mods.map(mod => {
      const modKeys = keys.filter(k => k.mod === mod.name && k.status === 'claimed');
      const keysSold = modKeys.length;
      const revenue = modKeys.reduce((acc, key) => acc + (key.price || 0), 0);
      return {
        name: mod.name,
        keysSold,
        revenue,
      };
    });
    return sales;
  }, [keys, selectedMod]);


  const handleGenerateKeys = async () => {
    if (!newKeyValues.trim() || !newKeyPlan || !newKeyMod) {
      toast({
        title: 'Validation Error',
        description: 'Mod, Key value(s) and plan are required.',
        variant: 'destructive',
      });
      return;
    }

    const planDetails = plans.find(p => p.duration === newKeyPlan);
    if (!planDetails) {
        toast({
            title: 'Invalid Plan',
            description: 'The selected plan does not exist.',
            variant: 'destructive',
        });
        return;
    }

    const keyValues = newKeyValues.split('\n').map(k => k.trim()).filter(k => k);
    if (keyValues.length === 0) {
       toast({
        title: 'Validation Error',
        description: 'Please enter at least one key value.',
        variant: 'destructive',
      });
      return;
    }

    const currentKeys = await getKeys();
    let generatedKeys: Key[] = [];
    let duplicatesFound = false;

    for (const keyValue of keyValues) {
        const keyExists = currentKeys.some(k => k.value === keyValue);
        if (keyExists) {
            toast({
                title: 'Duplicate Key',
                description: `Key "${keyValue}" already exists.`,
                variant: 'destructive',
            });
            duplicatesFound = true;
            break;
        }

        const newKey: Key = {
            id: `key_${Date.now()}_${keyValue.slice(0, 5)}`,
            value: keyValue,
            mod: newKeyMod,
            plan: planDetails.duration,
            price: planDetails.price,
            createdAt: new Date().toISOString(),
            status: 'available',
        };
        generatedKeys.push(newKey);
    }
    
    if (duplicatesFound) {
      return;
    }

    const updatedKeys = [...currentKeys, ...generatedKeys];
    await saveKeys(updatedKeys);
    setKeys(updatedKeys);

    toast({
        title: 'Success!',
        description: `${generatedKeys.length} key(s) for ${newKeyMod} have been generated.`,
    })

    setNewKeyValues('');
    setNewKeyMod('');
    setNewKeyPlan(plans[0].duration);
    setIsAddKeyDialogOpen(false);
  };

  const handleOpenDeleteDialog = (key: Key) => {
    setKeyToDelete(key);
    setDeleteConfirmationChecked(false); // Reset checkbox on open
  };

  const confirmDeleteKey = async () => {
    if (!keyToDelete) return;

    const updatedKeys = keys.filter((k) => k.id !== keyToDelete.id);
    await saveKeys(updatedKeys);
    setKeys(updatedKeys);
    toast({
        title: 'Key Deleted',
        description: `The key "${keyToDelete.value}" has been removed.`,
    });
    setKeyToDelete(null); // Close the dialog
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <Button variant="ghost" size="icon" onClick={() => router.push('/home')}>
          <ArrowLeft />
        </Button>
        <h1 className="ml-4 text-2xl font-bold text-foreground font-headline">
          KRISTAL KEYS
        </h1>
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
            <TabsTrigger value="keys" className="border data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary">
              <KeyRound className="mr-2" /> Keys
            </TabsTrigger>
            <TabsTrigger value="balance" className="border data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary">
              <Wallet className="mr-2" /> Balance
            </TabsTrigger>
            <TabsTrigger value="expired" className="border data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary">
              <History className="mr-2" /> Expired Keys
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
           ) : (
            <>
              <TabsContent value="keys" className="animate-fade-in animate-slide-in-up [animation-duration:500ms]">
                <Card className="mt-4 bg-card/50 backdrop-blur-sm animate-border-glow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Key Management</CardTitle>
                          <CardDescription>
                            Add, view, and manage keys. Currently viewing: <span className="font-bold text-primary">{selectedMod}</span>
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Mod
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Select a Mod</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={selectedMod} onValueChange={setSelectedMod}>
                                    <DropdownMenuRadioItem value="All Mods">All Mods</DropdownMenuRadioItem>
                                    {mods.map(mod => (
                                        <DropdownMenuRadioItem key={mod.name} value={mod.name}>{mod.name}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex w-full items-center gap-2 pt-4">
                      {selectedMod === 'Kristal mod' ? (
                        <Button className="flex-grow" disabled>
                            <Clock className="mr-2 h-4 w-4" /> Coming Soon
                        </Button>
                      ) : (
                        <Button
                          className="flex-grow bg-primary/90 hover:bg-primary"
                          onClick={() => setIsAddKeyDialogOpen(true)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" /> Add New Key
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchKeys}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="available">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="available" className="border data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary">
                          <CheckCircle2 className="mr-2 text-green-500" />{' '}
                          Available Keys ({availableKeys.length})
                        </TabsTrigger>
                        <TabsTrigger value="claimed" className="border data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary">
                          <XCircle className="mr-2 text-yellow-500" /> Claimed Keys ({claimedKeys.length})
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="available" className="mt-4">
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Key</TableHead>
                                {selectedMod === 'All Mods' && <TableHead>Mod</TableHead>}
                                <TableHead>Plan</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {availableKeys.map((k) => (
                                <TableRow key={k.id}>
                                  <TableCell>
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">{k.value}</Badge>
                                  </TableCell>
                                  {selectedMod === 'All Mods' && <TableCell>{k.mod}</TableCell>}
                                  <TableCell>{k.plan}</TableCell>
                                  <TableCell>
                                    {new Date(k.createdAt).toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenDeleteDialog(k)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                               {availableKeys.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={selectedMod === 'All Mods' ? 5 : 4}
                                    className="text-center text-muted-foreground"
                                  >
                                    No available keys found for this mod.
                                  </TableCell>
                                </TableRow>
                              )}
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
                                {selectedMod === 'All Mods' && <TableHead>Mod</TableHead>}
                                <TableHead>Plan</TableHead>
                                <TableHead>UTR Number</TableHead>
                                <TableHead>Claimed At</TableHead>
                                <TableHead className="text-right">
                                  Actions
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {claimedKeys.map((k) => (
                                <TableRow key={k.id}>
                                  <TableCell>
                                    <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-black">{k.value}</Badge>
                                  </TableCell>
                                  {selectedMod === 'All Mods' && <TableCell>{k.mod}</TableCell>}
                                  <TableCell>{k.plan}</TableCell>
                                  <TableCell className="font-mono text-xs">{k.utr || 'N/A'}</TableCell>
                                  <TableCell>
                                    {k.claimedAt
                                      ? new Date(k.claimedAt).toLocaleString()
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenDeleteDialog(k)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                               {claimedKeys.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={selectedMod === 'All Mods' ? 6 : 5}
                                    className="text-center text-muted-foreground"
                                  >
                                    No claimed keys found for this mod.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="balance" className="animate-fade-in animate-slide-in-up [animation-duration:500ms]">
                <div className="mt-4 space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
                    <CardHeader>
                      <CardTitle>Balance Information for <span className="text-primary">{selectedMod}</span></CardTitle>
                      <CardDescription>
                        View payment amounts and key statistics for the selected mod.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Balance
                          </p>
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold flex items-center">
                          <IndianRupee className="h-5 w-5 mr-1" />
                          {totalBalance.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          From all claimed keys
                        </p>
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Total Keys
                          </p>
                          <List className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-2xl font-bold">{totalKeys}</p>
                        <p className="text-xs text-muted-foreground">
                          All generated keys
                        </p>
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Available Keys
                          </p>
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold">{availableKeysCount}</p>
                        <Progress value={availablePercentage} className="h-2 mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {availablePercentage.toFixed(0)}% of total
                        </p>
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Active Claimed
                          </p>
                          <XCircle className="h-5 w-5 text-yellow-500" />
                        </div>
                        <p className="text-2xl font-bold">{activeClaimedCount}</p>
                        <p className="text-xs text-muted-foreground">
                          Currently active keys
                        </p>
                      </Card>
                      <Card className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm font-medium text-muted-foreground">
                            Expired Keys
                          </p>
                          <Clock className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-2xl font-bold">{expiredKeysCount}</p>
                        <p className="text-xs text-muted-foreground">
                          Total expired keys
                        </p>
                      </Card>
                    </CardContent>
                  </Card>

                  <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
                    <CardHeader>
                      <CardTitle>Keys by Plan</CardTitle>
                      <CardDescription>
                        Breakdown of keys for each subscription plan for <span className="font-bold text-primary">{selectedMod}</span>.
                      </CardDescription>
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
                            {keysByPlan.map((plan) => (
                              <TableRow key={plan.duration}>
                                <TableCell>{plan.duration}</TableCell>
                                <TableCell>{plan.price}</TableCell>
                                <TableCell>{plan.total}</TableCell>
                                <TableCell className="text-green-500 font-semibold">
                                  {plan.available}
                                </TableCell>
                                <TableCell className="text-yellow-500 font-semibold">
                                  {plan.claimed}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                   {selectedMod === 'All Mods' && (
                    <Card className="bg-card/50 backdrop-blur-sm animate-border-glow">
                      <CardHeader>
                        <CardTitle>Sales by Mod</CardTitle>
                        <CardDescription>
                          Breakdown of sales for each mod.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Mod Name</TableHead>
                                <TableHead>Keys Sold</TableHead>
                                <TableHead>Total Revenue</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {salesByMod.map((modSale) => (
                                <TableRow key={modSale.name}>
                                  <TableCell className="flex items-center gap-2"><Cpu className="h-4 w-4 text-muted-foreground" /> {modSale.name}</TableCell>
                                  <TableCell className="font-semibold">{modSale.keysSold}</TableCell>
                                  <TableCell className="font-semibold flex items-center">
                                    <IndianRupee className="h-4 w-4 mr-1"/>
                                    {modSale.revenue.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                   )}
                </div>
              </TabsContent>

              <TabsContent value="expired" className="animate-fade-in animate-slide-in-up [animation-duration:500ms]">
                <Card className="mt-4 bg-card/50 backdrop-blur-sm animate-border-glow">
                  <CardHeader>
                    <CardTitle>Expired Keys</CardTitle>
                    <CardDescription>
                      View all keys that have expired for <span className="font-bold text-primary">{selectedMod}</span>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Key</TableHead>
                             {selectedMod === 'All Mods' && <TableHead>Mod</TableHead>}
                            <TableHead>Plan</TableHead>
                            <TableHead>UTR Number</TableHead>
                            <TableHead>Claimed At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expiredKeys.map((k) => (
                            <TableRow key={k.id}>
                              <TableCell>
                                <Badge variant="destructive">{k.value}</Badge>
                              </TableCell>
                              {selectedMod === 'All Mods' && <TableCell>{k.mod}</TableCell>}
                              <TableCell>{k.plan}</TableCell>
                              <TableCell className="font-mono text-xs">{k.utr || 'N/A'}</TableCell>
                              <TableCell>
                                {k.claimedAt
                                  ? new Date(k.claimedAt).toLocaleString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDeleteDialog(k)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {expiredKeys.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={selectedMod === 'All Mods' ? 6 : 5}
                                className="text-center text-muted-foreground"
                              >
                                No expired keys found for this mod.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>

        <Dialog open={isAddKeyDialogOpen} onOpenChange={setIsAddKeyDialogOpen}>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Generate New Keys</DialogTitle>
                    <DialogDescription>
                        Create one or more keys for a specific mod and plan.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="key-mod">Mod</Label>
                        <Select value={newKeyMod} onValueChange={setNewKeyMod}>
                            <SelectTrigger id="key-mod">
                                <SelectValue placeholder="Select a mod" />
                            </SelectTrigger>
                            <SelectContent>
                                {mods.filter(m => m.status === 'available').map(m => (
                                    <SelectItem key={m.name} value={m.name}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="key-plan">Plan</Label>
                        <Select value={newKeyPlan} onValueChange={setNewKeyPlan}>
                            <SelectTrigger id="key-plan">
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map(p => (
                                    <SelectItem key={p.duration} value={p.duration}>
                                        {p.duration} ({p.price} Rs)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key-values">Key Values</Label>
                        <Textarea 
                            id="key-values"
                            placeholder="PREMIUM-USER-1\nPREMIUM-USER-2\nPREMIUM-USER-3"
                            value={newKeyValues}
                            onChange={e => setNewKeyValues(e.target.value)}
                            className="min-h-[120px]"
                        />
                         <p className="text-xs text-muted-foreground">
                            Enter one key per line to generate multiple keys.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleGenerateKeys} disabled={!newKeyMod}>
                        <FilePlus className="mr-2 h-4 w-4" /> Generate Keys
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!keyToDelete} onOpenChange={(open) => !open && setKeyToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-destructive" /> Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to permanently delete the key <span className="font-bold text-foreground">{keyToDelete?.value}</span> for mod <span className="font-bold text-foreground">{keyToDelete?.mod}</span>. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex items-center space-x-2 my-4">
                    <Checkbox id="delete-confirm" checked={deleteConfirmationChecked} onCheckedChange={(checked) => setDeleteConfirmationChecked(Boolean(checked))} />
                    <Label htmlFor="delete-confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I understand, delete this key.
                    </Label>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setKeyToDelete(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={confirmDeleteKey}
                        disabled={!deleteConfirmationChecked}
                        className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        Delete Key
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    </div>
  );
}
    

    

    

