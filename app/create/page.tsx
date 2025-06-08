'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { getUserProfile } from "../../lib/contracts";
import { calculateTotalBalance, formatBalance, CategorizedObjects } from "@/utils/assetsHelpers";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { packageId, suiClient } from "@/config";
import { Transaction } from "@mysten/sui/transactions"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCoinType(coinType: string, maxLength: number = 10): string {
  if (coinType.length <= maxLength) return coinType;
  const start = coinType.slice(0, 4);
  const end = coinType.slice(-4);
  return `${start}...${end}`;
}

const formSchema = z.object({
  token: z.string({
    required_error: "Please select a token to lock",
  }),
  amount: z.string({
    required_error: "Please enter the amount to lock",
  }).refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid amount",
  }),
  unlockDate: z.date({
    required_error: "Please select an unlock date",
  }),
  unlockTime: z.string({
    required_error: "Please select an unlock time",
  }),
});

function TokenDisplay({ coinType, coins, }: { coinType: string, coins: any[] }) {
  const totalBalance = calculateTotalBalance(coins);
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="size-5 shrink-0 rounded-full bg-blue-500" />
        <span className="truncate">{coinType.split("::").pop()}</span>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        {formatBalance(totalBalance)}
      </span>
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { toast } = useToast();
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null);
  const [selectedTokenBalance, setSelectedTokenBalance] = useState<string>("0");

  // Calculate default unlock time (3 minutes from now)
  const now = new Date();
  const defaultUnlockTime = new Date(now.getTime() + 3 * 60000);
  const formattedDefaultUnlockTime = `${defaultUnlockTime.getHours().toString().padStart(2, '0')}:${defaultUnlockTime.getMinutes().toString().padStart(2, '0')}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      amount: "",
      unlockDate: new Date(), // Default to current date
      unlockTime: formattedDefaultUnlockTime, // Default to 3 minutes from now
    },
  });

  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address);
          setUserObjects(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    }

    fetchUserProfile();
  }, [account]);

  useEffect(() => {
    if (userObjects && Object.keys(userObjects.coins).length > 0) {
      const firstCoinType = Object.keys(userObjects.coins)[0];
      form.setValue("token", firstCoinType);
      updateSelectedTokenBalance(firstCoinType);
    }
  }, [userObjects, form]);

  const updateSelectedTokenBalance = (coinType: string) => {
    if (userObjects?.coins[coinType]) {
      const balance = calculateTotalBalance(userObjects.coins[coinType]);
      setSelectedTokenBalance(formatBalance(balance));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Combine unlock date and unlock time into a single timestamp
    const unlockDate = values.unlockDate;
    const [hours, minutes] = values.unlockTime.split(':').map(Number);
    unlockDate.setHours(hours, minutes, 0, 0);
    const unlockTimestamp = Math.floor(unlockDate.getTime() / 1000);

    // TODO: Implement token locking logic
    console.log('Form submitted with values:', values, account?.address);
    toast({
      title: "Lock Request Submitted",
      description: "Your tokens will be locked until the unlock date.",
    });

    // 1. Get form data
    const { amount: amountStr, token } = values;

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
    // 取balance最多的object用于split
    let coinObjectId = userObjects.coins[token]?.[0].data?.objectId;
    let balance = userObjects.coins[token]?.[0].data?.content?.fields?.balance;
    if (userObjects?.coins[token]?.length > 1) {
      for (const coin of userObjects.coins[token]) {
        console.warn('111',token,coin)
        const coinBalance = Number(coin.data?.content?.fields?.balance);
        if (coinBalance && typeof coinBalance === 'number' && coinBalance > balance) {
          coinObjectId = coin.data?.objectId;
          balance = coinBalance;
        }
      }
    }
    // Get first coin object's objectId

    if (!coinObjectId) {
      toast({
        title: "Error",
        description: "Failed to get coin object ID",
        variant: "destructive"
      });
      return;
    }

    // 2. Process timestamp
    const startTimestamp = Math.floor(Date.now() / 1000);
    // Use unlockTimestamp calculated from form values
    const endTimestamp = unlockTimestamp; // Use the calculated unlock timestamp

    const FEE_PERCENTAGE = 10;
    const SUI_PAYMENT = 100000;

    // 3. Construct transaction
    const tx = new Transaction();
    tx.setGasBudget(100000000);

    // Convert amount to base units
    const amountNum = Number(amountStr);
    const amountInBaseUnits = BigInt(Math.floor(amountNum * 1000000000));
    const amountToSplit = BigInt(Math.floor(amountNum * 1000000000 * 1.01));

    const [splitCoins1] = tx.splitCoins(tx.object(coinObjectId), [amountToSplit]);

    // Log all parameters for debugging
    console.log("Lock parameters:", {
      amount: amountInBaseUnits.toString(),
      token,
      startTimestamp,
      endTimestamp,
      address: account?.address
    });

    const walletAddress = account?.address;
    console.log("Current wallet address:", walletAddress);

    tx.moveCall({
      target: `${packageId}::protocol::create`,
      arguments: [
        tx.pure.u64(FEE_PERCENTAGE),
        tx.pure.u64(SUI_PAYMENT),
        tx.pure.u64(startTimestamp), // Using current time as create timestamp
        tx.object(splitCoins1),
        tx.gas,
        tx.pure.u64(amountInBaseUnits),
        tx.pure.u64(startTimestamp), // Using current time as start time
        tx.pure.u64(endTimestamp), // Using calculated unlock timestamp as end time
        tx.pure.address('0xd42be77af3dd116fccb8c5147971a85ebec9aa2091b171495d716837234de5af'), // 接收方
        tx.pure.address('0xd42be77af3dd116fccb8c5147971a85ebec9aa2091b171495d716837234de5af'), // 手续费地址
      ],
      typeArguments: [token],
    });

    tx.mergeCoins(tx.object(coinObjectId), [splitCoins1]);

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
            title: "Transaction Processing",
            variant: "default",
          });

          const response = await suiClient.waitForTransaction({
            digest: digest,
            options: {
              showEffects: true,
            },
          });
          console.log("effects", response.effects,);
          console.log('status', response?.effects?.status?.status)

          const newContractObjectId = response.effects?.created?.[1]?.reference.objectId;
          if (newContractObjectId) {
            const keyInStorage = JSON.stringify({ newContractObjectId: newContractObjectId, amount: amountInBaseUnits.toString() })
            window.localStorage.setItem('ELP-newContractObjectId', keyInStorage);
            console.warn('newContractObjectId', keyInStorage, 'token:', token, 'amount', amountNum)
            // 成功时弹出提示框
            toast({
              title: `Lock Successfully`,
              description: "Redirecting...",
              variant: "default",
            });
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          } else {
            toast({
              title: "Transaction Failed",
              description: "Failed to create vesting contract. Please try again.",
              variant: "destructive",
            })
          }
        },
        onError: (error) => {
          toast({
            title: "Transaction Failed",
            description:
              error.message ||
              "Failed to create vesting contract. Please try again.",
            variant: "destructive",
          });
          console.error("Error:", error);
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Lock Tokens</h1>
          <p className="text-sm text-muted-foreground">
            Select tokens to lock and choose an unlock date and time. Locked tokens cannot be traded until the unlock date.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Token</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          updateSelectedTokenBalance(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-input bg-background">
                            <SelectValue>
                              {userObjects?.coins[field.value] && (
                                <TokenDisplay
                                  coinType={field.value}
                                  coins={userObjects.coins[field.value]}
                                />
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userObjects && Object.entries(userObjects.coins).map(([coinType, coins]) => (
                            <SelectItem key={coinType} value={coinType}>
                              <TokenDisplay coinType={coinType} coins={coins} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount to lock"
                          className="border-input bg-background"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground">
                        Available Balance: {selectedTokenBalance}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="unlockDate"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel>Unlock Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() // Disable past dates
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unlockTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unlock Time</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            className="border-input bg-background"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>

            <Button className="w-full" size="lg" >
              Confirm Lock
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}