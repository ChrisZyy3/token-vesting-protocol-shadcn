'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VestingContract {
  id: string;
  token: string;
  totalAmount: string;
  recipients: number;
  startDate: string;
  status: 'active' | 'pending' | 'completed';
}

export default function List() {
  const router = useRouter()
  const account = useCurrentAccount()
  const [contracts, setContracts] = useState<VestingContract[]>([])

  useEffect(() => {
    // 模拟数据
    setContracts([
      {
        id: '0x123',
        token: 'SUI',
        totalAmount: '1000',
        recipients: 3,
        startDate: '2024-03-01',
        status: 'active'
      },
      {
        id: '0x456',
        token: 'USDC',
        totalAmount: '5000',
        recipients: 2,
        startDate: '2024-02-15',
        status: 'pending'
      },
      {
        id: '0x789',
        token: 'SUI',
        totalAmount: '3000',
        recipients: 1,
        startDate: '2024-01-01',
        status: 'completed'
      }
    ])
  }, [])

  const renderContract = (contract: VestingContract) => (
    <Card key={contract.id} className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Contract ID</div>
          <div>{contract.id}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm text-muted-foreground">Token</div>
          <div>{contract.token}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div>{contract.totalAmount}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm text-muted-foreground">Recipients</div>
          <div>{contract.recipients}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm text-muted-foreground">Start Date</div>
          <div>{contract.startDate}</div>
        </div>
        <div className="space-y-1 text-right">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="capitalize">{contract.status}</div>
        </div>
      </div>
    </Card>
  )

  const activeContracts = contracts.filter(c => c.status !== 'completed')
  const completedContracts = contracts.filter(c => c.status === 'completed')

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">Vesting Contracts</h1>
          <Button onClick={() => router.push('/create')}>
            Create New Contract
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Contracts</TabsTrigger>
            <TabsTrigger value="completed">Fully Vested</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="mt-6 space-y-4">
            {activeContracts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No active contracts found
              </div>
            ) : (
              activeContracts.map(renderContract)
            )}
          </TabsContent>
          <TabsContent value="completed" className="mt-6 space-y-4">
            {completedContracts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No completed contracts found
              </div>
            ) : (
              completedContracts.map(renderContract)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 