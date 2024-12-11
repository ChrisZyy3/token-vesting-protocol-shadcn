'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ArrowUpRight, Clock, Lock, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VestingSchedule {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  sender: string;
  totalAmount: string;
  vestedAmount: string;
  startDate: string;
  endDate: string;
  nextUnlock: string;
  status: 'active' | 'pending' | 'completed';
  progress: number;
  claimableAmount: string;
}

export default function Dashboard() {
  const account = useCurrentAccount();
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);

  useEffect(() => {
    // Mock data
    setVestingSchedules([
      {
        id: '0x123',
        tokenName: 'Sui Token',
        tokenSymbol: 'SUI',
        sender: '0x123...abc',
        totalAmount: '10000',
        vestedAmount: '2500',
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        nextUnlock: '2024-04-01',
        status: 'active',
        progress: 25,
        claimableAmount: '500',
      },
      {
        id: '0x456',
        tokenName: 'USD Coin',
        tokenSymbol: 'USDC',
        sender: '0x456...def',
        totalAmount: '5000',
        vestedAmount: '0',
        startDate: '2024-04-01',
        endDate: '2024-10-01',
        nextUnlock: '2024-04-01',
        status: 'pending',
        progress: 0,
        claimableAmount: '0',
      },
    ]);
  }, []);

  if (!account) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Connect Your Wallet</h2>
          <p className="mt-2 text-muted-foreground">Please connect your wallet to view your vesting schedules</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Vesting Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Track your vesting schedules and upcoming unlocks
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Contracts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{vestingSchedules.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Active Vestings</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {vestingSchedules.filter(s => s.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Pending Start</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {vestingSchedules.filter(s => s.status === 'pending').length}
          </p>
        </Card>
      </div>

      {/* Vesting Schedules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Vesting Schedules</h2>
        {vestingSchedules.map((schedule) => (
          <Card key={schedule.id} className="overflow-hidden">
            <div className="border-b border-border p-4 dark:border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">
                    {schedule.tokenName}
                    <span className="ml-2 text-sm text-muted-foreground">({schedule.tokenSymbol})</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">From: {schedule.sender}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{schedule.vestedAmount} / {schedule.totalAmount}</p>
                  <p className="text-sm text-muted-foreground">{schedule.progress}% Vested</p>
                  {schedule.claimableAmount !== '0' && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {schedule.claimableAmount} {schedule.tokenSymbol} Available
                    </p>
                  )}
                </div>
              </div>
              <Progress value={schedule.progress} className="mt-4" />
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium text-foreground">{schedule.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium text-foreground">{schedule.endDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Unlock</p>
                <p className="font-medium text-foreground">{schedule.nextUnlock}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-muted/50 p-2 dark:border-border/50">
              <button className="flex items-center gap-1 rounded-sm px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                View Details
                <ArrowUpRight className="size-4" />
              </button>
              {schedule.claimableAmount !== '0' && (
                <button
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30 dark:shadow-primary/10 dark:hover:shadow-primary/20"
                  onClick={() => {
                    // TODO: 处理 claim 逻辑
                    console.log('Claiming tokens:', schedule.id);
                  }}
                >
                  <Wallet className="size-4" />
                  Claim Tokens
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 