
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
import React from 'react';


// Mock data for demonstration until backend is connected
const availableKeys = [
  { id: '1', key: 'AVBL-XYZ-789', plan: '1 Month', createdAt: '2023-10-27' },
  { id: '2', key: 'AVBL-ABC-123', plan: '7 Day', createdAt: '2023-10-26' },
];

const claimedKeys = [
    { id: '3', key: 'CLMD-PQR-456', plan: '15 Day', createdAt: '2023-10-25', claimedBy: 'user123' },
];


export default function AdminPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center p-4 border-b border-border">
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
                            Add, view, and manage keys here. Data is synced with the database.
                        </CardDescription>
                    </div>
                    <div className='flex gap-2'>
                        <Button size="sm" className='bg-primary/90 hover:bg-primary'>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Key
                        </Button>
                        <Button variant="outline" size="icon">
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
                                        <TableCell><Badge variant="secondary">{k.key}</Badge></TableCell>
                                        <TableCell>{k.plan}</TableCell>
                                        <TableCell>{k.createdAt}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
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
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {claimedKeys.map((k) => (
                                    <TableRow key={k.id}>
                                        <TableCell><Badge variant="secondary">{k.key}</Badge></TableCell>
                                        <TableCell>{k.plan}</TableCell>
                                        <TableCell>{k.createdAt}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
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
          
          <TabsContent value="balance">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Balance</CardTitle>
                    <CardDescription>View your current balance and transaction history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">Balance functionality coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="expired">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Expired Keys</CardTitle>
                    <CardDescription>View all keys that have expired.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground">Expired keys list coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
