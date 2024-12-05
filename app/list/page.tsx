'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"
import { useCurrentAccount } from "@mysten/dapp-kit"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

  // TODO: 从链上获取合约列表
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
      }
    ])
  }, [])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">My Vesting Contracts</h1>
          <Button onClick={() => router.push('/create')}>
            Create New Contract
          </Button>
        </div>

        <div className="space-y-4">
          {contracts.map((contract) => (
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
          ))}
        </div>
      </div>
    </div>
  )
} 