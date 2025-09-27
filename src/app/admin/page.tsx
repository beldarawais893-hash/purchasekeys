
'use client';

import { useState, useEffect, useCallback } from 'react';
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
  IndianRupee,
  ShieldCheck,
  History,
  AlertTriangle,
} from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
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
import { Checkbox } from '@/components/ui/checkbox';

const plans = [
  { duration: '1 Day', price: '200' },
  { duration: '3 Day', price: '350' },
  { duration: '7 Day', price: '500' },
  { duration: '15 Day', price: '720' },
  { duration: '1 Month', price: '1000' },
];

type Key = {
  id: string;
  value: string;
  plan: string;
  createdAt: string;
  claimedAt?: string;
  status: 'available' | 'claimed';
  utr?: string;
};

const ADMIN_PASSWORD = '3131';

const isKeyExpired = (key: Key): boolean => {
    if (key.status !== 'claimed' || !key.claimedAt) {
        return false;
    }
    const claimedDate = parseDate(key.claimedAt);
    if (!claimedDate) return false;

    const expiryDate = new Date(claimedDate);
    if (key.plan.includes('Day')) {
        const days = parseInt(key.plan.split(' ')[0]);
        expiryDate.setDate(claimedDate.getDate() + days);
    } else if (key.plan.includes('Month')) {
        const months = parseInt(key.plan.split(' ')[0]);
        expiryDate.setMonth(claimedDate.getMonth() + months);
    }
    
    return new Date() > expiryDate;
};

const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split(', ');
    if (parts.length < 2) return null;
    const [datePart, timePart] = parts;
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    if (!year || !month || !day || !hours || !minutes) return null;
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
};


export default function AdminPage() {
  const [keys, setKeys] = useState<Key[]>([]);
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [activeTab, setActiveTab] = useState('keys');
  const { toast } = useToast();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<Key | null>(null);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedWelcome');
    if (hasVisited !== 'true') {
      router.replace('/');
      return;
    }
    
    const sessionAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (sessionAuthenticated === 'true') {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, [router]);

  const persistKeys = useCallback((updatedKeys: Key[]) => {
    localStorage.setItem('appKeys', JSON.stringify(updatedKeys));
    setKeys(updatedKeys);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const storedKeys = localStorage.getItem('appKeys');
        if (storedKeys) {
          const parsedKeys: Key[] = JSON.parse(storedKeys);
          if (Array.isArray(parsedKeys)) {
            setKeys(parsedKeys);
          } else {
             setKeys([]);
          }
        } else {
            setKeys([]);
        }
      } catch (error) {
        console.error("Failed to parse keys from localStorage", error);
        setKeys([]); 
      }
    }
  }, [isAuthenticated]);
  

  const handlePasswordSubmit = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      toast({
        title: 'Success',
        description: 'Access granted.',
      });
    } else {
      toast({
        title: 'Error',
        description: 'Incorrect password.',
        variant: 'destructive',
      });
      setPasswordInput('');
    }
  };

  const handleAddKey = () => {
    if (!newKey.trim() || !selectedPlan) {
      toast({
        title: 'Error',
        description: 'Please enter a key and select a plan.',
        variant: 'destructive',
      });
      return;
    }

    const keyExists = keys.some(key => key.value === newKey.trim());
    if (keyExists) {
        toast({
            title: 'Error',
            description: 'Key already exists.',
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
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
      status: 'available',
    };
    
    const storedKeys = localStorage.getItem('appKeys');
    const currentKeys: Key[] = storedKeys ? JSON.parse(storedKeys) : [];
    const updatedKeys = [...currentKeys, keyToAdd];
    persistKeys(updatedKeys); 


    setNewKey('');
    setSelectedPlan('');
    setIsAddKeyDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Key added successfully.',
    });
  };

  const handleBack = () => {
    sessionStorage.removeItem('adminAuthenticated');
    router.push('/home');
  }

  const handleDeleteClick = (key: Key) => {
    setKeyToDelete(key);
    setIsDeleteDialogOpen(true);
    setIsDeleteConfirmed(false); // Reset confirmation checkbox
  };

  const confirmDelete = () => {
    if (!keyToDelete) return;
    const updatedKeys = keys.filter((key) => key.id !== keyToDelete.id);
    persistKeys(updatedKeys);
    toast({
      title: 'Success',
      description: 'Key deleted successfully.',
    });
    setIsDeleteDialogOpen(false);
    setKeyToDelete(null);
  };


  const planOrder = plans.reduce((acc, plan, index) => {
    acc[plan.duration] = index;
    return acc;
  }, {} as Record<string, number>);

  const sortKeysByPlan = (a: Key, b: Key) => {
    return (planOrder[a.plan] ?? 99) - (planOrder[b.plan] ?? 99);
  };
  
  const availableKeys = keys.filter(key => key.status === 'available').sort(sortKeysByPlan);
  const allClaimedKeys = keys.filter(key => key.status === 'claimed');

  const activeClaimedKeys = allClaimedKeys.filter(key => !isKeyExpired(key)).sort(sortKeysByPlan);
  const expiredKeysList = allClaimedKeys.filter(key => isKeyExpired(key)).sort(sortKeysByPlan);

  const totalKeys = keys.length;

  const keysByPlan = plans.map(plan => {
    const planKeys = keys.filter(key => key.plan === plan.duration);
    const available = planKeys.filter(k => k.status === 'available').length;
    const claimed = planKeys.filter(k => k.status === 'claimed').length;
    return {
      name: plan.duration,
      total: planKeys.length,
      available,
      claimed: claimed,
      price: `${plan.price} Rs`
    };
  });

  const totalBalance = allClaimedKeys.reduce((acc, key) => {
    const plan = plans.find(p => p.duration === key.plan);
    if (plan) {
        return acc + parseInt(plan.price);
    }
    return acc;
  }, 0);

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-background"></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Dialog open={true} onOpenChange={(open) => {
          if(!open) {
             router.push('/home');
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Admin Access</DialogTitle>
              <DialogDescription>
                Please enter the password to access the owner panel.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="password" className="sr-only">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="****"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
              </div>
            </div>
            <DialogFooter className="sm:justify-start">
               <Button type="submit" onClick={handlePasswordSubmit}>
                  Unlock
                </Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/home')}>
                Go Back
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="bg-card text-card-foreground p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
            <div className='flex items-center gap-2'>
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft />
              </Button>
              <ShieldCheck className="text-primary h-6 w-6" />
              <h1 className="text-xl font-bold whitespace-nowrap">Purchase Key</h1>
            </div>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <Button className="flex-1 sm:flex-initial" variant={activeTab === 'keys' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('keys')}>
            <KeyRound className="mr-2 h-4 w-4" />
            Keys
          </Button>
          <Button className="flex-1 sm:flex-initial" variant={activeTab === 'balance' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('balance')}>
            <Wallet className="mr-2 h-4 w-4" />
            Balance
          </Button>
           <Button className="flex-1 sm:flex-initial" variant={activeTab === 'expired' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('expired')}>
            <History className="mr-2 h-4 w-4" />
            Expired Keys
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'keys' && (
          <>
            <Card className="bg-card mb-8">
              <CardHeader>
                <CardTitle className="text-primary">Key Management</CardTitle>
                <CardDescription>Add, view, and manage keys here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="bg-accent" onClick={() => setIsAddKeyDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Key
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card mb-8">
              <CardHeader>
                <CardTitle className="text-primary">Available Keys</CardTitle>
                <CardDescription>
                  These keys are available for users to purchase.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0">
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
                      <TableRow key={key.id}>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-800/20 border-green-500 text-green-400">
                            {key.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.plan}</TableCell>
                        <TableCell>{key.createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(key)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-card mb-8">
              <CardHeader>
                <CardTitle className="text-primary">Claimed Keys (Active)</CardTitle>
                <CardDescription>
                  These keys have been used and are currently active.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0">
                      <TableHead className="text-foreground font-semibold">Key</TableHead>
                      <TableHead className="text-foreground fontsemibold">UTR</TableHead>
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Claimed At</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeClaimedKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-800/20 border-yellow-500 text-yellow-400">
                            {key.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.utr}</TableCell>
                        <TableCell>{key.plan}</TableCell>
                        <TableCell>{key.claimedAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(key)}>
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
        {activeTab === 'expired' && (
           <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2"><History className="h-5 w-5"/> Expired Keys</CardTitle>
                <CardDescription>
                  These keys have been used and their validity period has ended.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0">
                      <TableHead className="text-foreground font-semibold">Key</TableHead>
                      <TableHead className="text-foreground font-semibold">UTR</TableHead>
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Claimed At</TableHead>
                      <TableHead className="text-right text-foreground font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredKeysList.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                           <Badge variant="outline" className="bg-red-800/20 border-red-500 text-red-400">
                            {key.value}
                          </Badge>
                        </TableCell>
                        <TableCell>{key.utr}</TableCell>
                        <TableCell>{key.plan}</TableCell>
                        <TableCell>{key.claimedAt}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(key)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        )}
        {activeTab === 'balance' && (
          <div className="space-y-8">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-primary">Balance Information</CardTitle>
                <CardDescription>
                  View payment amounts and available keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{totalBalance}</div>
                      <p className="text-xs text-muted-foreground">From all claimed keys</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                      <Boxes className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalKeys}</div>
                      <p className="text-xs text-muted-foreground">All generated keys</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Keys</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{availableKeys.length}</div>
                       <p className="text-xs text-muted-foreground">{totalKeys > 0 ? ((availableKeys.length / totalKeys) * 100).toFixed(0) : 0}% available</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-secondary/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Claimed Keys</CardTitle>
                      <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{allClaimedKeys.length}</div>
                      <p className="text-xs text-muted-foreground">{totalKeys > 0 ? ((allClaimedKeys.length / totalKeys) * 100).toFixed(0) : 0}% claimed</p>
                    </CardContent>
                  </Card>
              </CardContent>
            </Card>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-primary">Keys by Plan</CardTitle>
                <CardDescription>Breakdown of keys for each subscription plan.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0">
                      <TableHead className="text-foreground font-semibold">Plan</TableHead>
                      <TableHead className="text-foreground font-semibold">Price</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Total Keys</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Available</TableHead>
                      <TableHead className="text-center text-foreground font-semibold">Claimed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keysByPlan.map((plan) => (
                      <TableRow key={plan.name}>
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
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive"/>
              Are you sure you want to permanently delete this key?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the key
              <Badge variant="secondary" className="mx-1">{keyToDelete?.value}</Badge>
              from the system. This may have unintended side effects if the key is already in use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2 my-4">
            <Checkbox id="confirm-delete" checked={isDeleteConfirmed} onCheckedChange={(checked) => setIsDeleteConfirmed(Boolean(checked))} />
            <label
              htmlFor="confirm-delete"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand this action is irreversible.
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!isDeleteConfirmed}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
