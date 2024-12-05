'use client';

import { useEffect, useState } from "react";
import { format, addMonths, addYears } from "date-fns";
import { Calendar } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { getUserProfile } from "../../lib/contracts"
import { calculateTotalBalance, formatBalance, CategorizedObjects } from "@/utils/assetsHelpers"

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Balance } from "@/utils/assetsHelpers";
function formatCoinType(coinType: string, maxLength: number = 10): string {
  if (coinType.length <= maxLength) return coinType;

  const start = coinType.slice(0, 4);
  const end = coinType.slice(-4);
  return `${start}...${end}`;
}

const formSchema = z.object({
  token: z.string({
    required_error: "Please select a token.",
  }),
  vestingDuration: z.object({
    value: z.string(),
    unit: z.enum(["month", "year"]),
  }),
  unlockSchedule: z.enum(["weekly", "bi-weekly", "monthly", "quarterly"]),
  startUponCreation: z.boolean(),
  startDate: z.date().optional(),
  startTime: z.string().optional(),
  autoClaim: z.boolean(),
});

function TokenDisplay({ coinType, coins }: { coinType: string, coins: any[] }) {
  const totalBalance = calculateTotalBalance(coins)
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="size-5 shrink-0 rounded-full bg-blue-500" />
        <span className="truncate">{coinType.split("::").pop()}</span>
      </div>
      <span className="shrink-0 text-sm text-muted-foreground">
        ({formatCoinType(coinType)})
      </span>
      <span className="shrink-0 text-sm text-muted-foreground">
        {formatBalance(totalBalance)}
      </span>
    </div>
  )
}

export default function CreatePage() {
  const router = useRouter()
  const { formData, setFormData } = useCreateForm()
  const account = useCurrentAccount()
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "sui",
      vestingDuration: {
        value: "1",
        unit: "year",
      },
      unlockSchedule: "monthly",
      startUponCreation: true,
      autoClaim: true,
    },
  })

  useEffect(() => {
    if (formData) {
      form.reset({
        token: formData.token,
        vestingDuration: {
          value: formData.vestingDuration.value,
          unit: formData.vestingDuration.unit,
        },
        unlockSchedule: formData.unlockSchedule,
        startUponCreation: formData.startUponCreation,
        startDate: formData.startDate,
        startTime: formData.startTime,
        autoClaim: formData.autoClaim,
      })
    }
  }, [formData, form])

  useEffect(() => {
    async function fetchUserProfile() {
      if (account?.address) {
        try {
          const profile = await getUserProfile(account.address)
          setUserObjects(profile)
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      }
    }

    fetchUserProfile()
  }, [account])

  useEffect(() => {
    if (userObjects && Object.keys(userObjects.coins).length > 0) {
      const firstCoinType = Object.keys(userObjects.coins)[0];
      form.setValue("token", firstCoinType);
    }
  }, [userObjects, form]);

  const startUponCreation = form.watch("startUponCreation");
  const vestingDuration = form.watch("vestingDuration");

  const calculateEndDate = () => {
    const startDate = form.getValues("startDate") || new Date();
    const value = parseInt(vestingDuration.value) || 0;

    if (vestingDuration.unit === "month") {
      return addMonths(startDate, value);
    } else {
      return addYears(startDate, value);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const selectedTokenBalance: Balance | undefined = userObjects?.coins[values.token]
      && calculateTotalBalance(userObjects.coins[values.token])
    console.log('selectedTokenBalance', selectedTokenBalance, selectedTokenBalance && formatBalance(selectedTokenBalance))
    setFormData({
      ...values,
      tokenBalance: selectedTokenBalance && formatBalance(selectedTokenBalance) || '0'
    })
    console.log('Form submitted with values:', formData)

    router.push("/recipient")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">STEP 1</div>
          <h1 className="text-2xl font-semibold text-foreground">Schedule</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <div className="space-y-2">
              <FormLabel>Vesting Duration</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="vestingDuration.value"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          className="border-input bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vestingDuration.unit"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-[120px] border-input bg-background">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Fully vested on {format(calculateEndDate(), "yyyy/MM/dd")}
              </div>
            </div>

            <FormField
              control={form.control}
              name="unlockSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unlock Schedule</FormLabel>
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
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="border-input bg-card">
              <CardContent className="space-y-4 p-4">
                <FormField
                  control={form.control}
                  name="startUponCreation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel>Start Upon Contract Creation</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!startUponCreation && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start border-input bg-background text-left font-normal"
                                >
                                  <Calendar className="mr-2 size-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
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
                      name="startTime"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Start Time</FormLabel>
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
                )}
              </CardContent>
            </Card>

            <FormField
              control={form.control}
              name="autoClaim"
              render={({ field }) => (
                <Card className="border-input bg-card">
                  <CardContent className="p-4">
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Auto-Claim</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Tokens get claimed to recipient wallet automatically
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={true}
                          onCheckedChange={field.onChange}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  </CardContent>
                </Card>
              )}
            />

            <Button type="submit" className="w-full" size="lg">
              Next Step
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}