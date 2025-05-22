'use client';

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCurrentAccount } from "@mysten/dapp-kit";
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
  lockDuration: z.enum(["3months", "6months", "1year", "2years"], {
    required_error: "Please select a lock duration",
  }),
});

function TokenDisplay({ coinType, coins }: { coinType: string, coins: any[] }) {
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "",
      amount: "",
      lockDuration: "3months",
    },
  });

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Implement token locking logic
    console.log('Form submitted with values:', values);
    toast({
      title: "Lock Request Submitted",
      description: "Your tokens will be locked until the unlock date.",
    });
    router.push("/dashboard");
  }

  const getLockEndDate = (duration: string) => {
    const now = new Date();
    switch (duration) {
      case "3months":
        return new Date(now.setMonth(now.getMonth() + 3));
      case "6months":
        return new Date(now.setMonth(now.getMonth() + 6));
      case "1year":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      case "2years":
        return new Date(now.setFullYear(now.getFullYear() + 2));
      default:
        return now;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Lock Tokens</h1>
          <p className="text-sm text-muted-foreground">
            Select tokens to lock and choose a duration. Locked tokens cannot be traded until the unlock date.
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

                <FormField
                  control={form.control}
                  name="lockDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lock Duration</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-input bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground">
                        Unlock Date: {format(getLockEndDate(field.value), "MMMM dd, yyyy")}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Button type="submit" className="w-full" size="lg">
              Confirm Lock
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}