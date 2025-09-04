'use client';

import { useEffect, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { ArrowUpRight, Clock, Lock, Wallet } from "lucide-react";
import { Transaction } from "@mysten/sui/transactions";
import { useToast } from "@/hooks/use-toast";
import { packageId, suiClient } from "@/config";
import { calculateTotalBalance, formatBalance, CategorizedObjects } from "@/utils/assetsHelpers";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getUserProfile } from "../../lib/contracts"

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
  status: 'active' | 'completed';
  progress: number;
  claimableAmount: string;
}

export default function Dashboard() {
  const account = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const { toast } = useToast();
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>([]);
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address)
          console.log('profile', profile);
          setUserObjects(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [account])

  // Define the claim function
  const handleClaim = async (schedule: VestingSchedule) => {
    console.log('Attempting to claim tokens for schedule:', schedule.id);

    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }
    // 暂时写死TOKEN
    const token = "0x8915a33e466de62e356de9e01038b20db1e80239715158163b774f81bcd291ff::coin::COIN"
    console.warn('usersob',userObjects)
    // 2. Get selected coin object
    if (!userObjects?.coins[token] || userObjects.coins[token].length === 0) {
      toast({
        title: "Error",
        description: "No coins available for selected token",
        variant: "destructive"
      });
      return;
    }

    // Get first coin object's objectId
    const coinObjectId = userObjects.coins[token][0].data?.objectId;
    if (!coinObjectId) {
      toast({
        title: "Error",
        description: "Failed to get coin object ID",
        variant: "destructive"
      });
      return;
    }

    if (schedule.claimableAmount === '0') {
      toast({
        title: "Info",
        description: "No claimable tokens available for this schedule.",
        variant: "default",
      });
      return;
    }

    const tx = new Transaction();
    tx.setGasBudget(10000000);

    // Assuming the token type is SUI for now. Replace with actual token type if available in schedule.
    const tokenType = "0x2::sui::SUI"; // Placeholder - **Replace with actual token type**
    const adminConfigObjectId = "0xe57a675ddaffce44dc72f2930539309a40dbee09b2fe79141b65d4370b8dc3c8"; // Placeholder - **Replace with actual Admin Config Object ID**

    try {
      // Convert claimable amount to BigInt
      const amountToClaim = BigInt(schedule.claimableAmount);

      tx.moveCall({
        target: `${packageId}::protocol::withdraw`,
        arguments: [
          tx.object('0x839986943680a26e657982984ff232d1a567d9649f79571b093bd69a1dc965f4'), // Contract Object ID
          tx.object.clock, // Admin Config Object ID
          tx.pure.u64(111), // Amount to withdraw
        ],
        typeArguments: ["0x8915a33e466de62e356de9e01038b20db1e80239715158163b774f81bcd291ff::coin::COIN"],
      });

      signAndExecute(
        {
          transaction: tx as any, // Type assertion to fix Transaction type mismatch
          option: {
            showEffects: true,
            showBalanceChanges: true,
            showInput: true,
          }
        },
        {
          onSuccess: async ({ digest }) => {
            
            toast({
              title: "Claim Successful",
              description: `Claim transaction submitted with digest: ${digest}`,
              variant: "default",
            });
            console.log("Claim Transaction Digest:", digest);
            // Optionally refresh the vesting schedules after a successful claim
            // fetchVestingSchedules(); // You would need to implement this function
            const response = await suiClient.waitForTransaction({
              digest: digest,
              options: {
                showEffects: true,
              },
            });
            console.log("effects", response.effects,);
            console.log('status', response?.effects?.status?.status)
          },
          onError: (error) => {
            toast({
              title: "Claim Failed",
              description: error.message || "Failed to claim tokens. Please try again.",
              variant: "destructive",
            });
            console.error("Claim Error:", error);
          }
        }
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare claim transaction.",
        variant: "destructive",
      });
      console.error("Prepare Claim Transaction Error:", error);
    }
  };

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
    ]);
  }, []);

  if (!account) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground">Connect Your Wallet</h2>
          <p className="mt-2 text-muted-foreground">Please connect your wallet to view your locked tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Locked Tokens Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Track your locked tokens and upcoming unlocks
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Locked Tokens</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">{vestingSchedules.length}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Active Locks</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {vestingSchedules.filter(s => s.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Next Unlock</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {vestingSchedules.length > 0 ? vestingSchedules[0].nextUnlock : 'No active locks'}
          </p>
        </Card>
      </div>

      {/* Locked Tokens List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Locked Tokens</h2>
        {vestingSchedules.map((schedule) => (
          <Card key={schedule.id} className="overflow-hidden">
            <div className="border-b border-border p-4 dark:border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">
                    {schedule.tokenName}
                    <span className="ml-2 text-sm text-muted-foreground">({schedule.tokenSymbol})</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Locked Amount: {schedule.totalAmount} {schedule.tokenSymbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{schedule.vestedAmount} / {schedule.totalAmount}</p>
                  <p className="text-sm text-muted-foreground">{schedule.progress}% Unlocked</p>
                  {schedule.claimableAmount !== '0' && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {schedule.claimableAmount} {schedule.tokenSymbol} Available to Claim
                    </p>
                  )}
                </div>
              </div>
              <Progress value={schedule.progress} className="mt-4" />
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Lock Start</p>
                <p className="font-medium text-foreground">{schedule.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lock End</p>
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
                  onClick={() => handleClaim(schedule)}
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