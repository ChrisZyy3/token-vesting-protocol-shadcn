'use client';

import { useEffect } from "react";
import { format, addMonths, addYears } from "date-fns";
import { Calendar } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"

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

export default function CreatePage() {
  const router = useRouter()
  const { formData, setFormData } = useCreateForm()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: "sui",
      vestingDuration: {
        value: "1",
        unit: "year",
      },
      unlockSchedule: "monthly",
      startUponCreation: false,
      autoClaim: false,
    },
  });

  useEffect(() => {
    if (formData) {
      form.reset(formData);
    }
  }, [formData, form]);

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
    setFormData(values)
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
                          <div className="flex items-center gap-2">
                            <div className="size-5 rounded-full bg-blue-500" />
                            SUI (0x2::SUI)
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sui">
                        <div className="flex items-center gap-2">
                          <div className="size-5 rounded-full bg-blue-500" />
                          SUI (0x2::SUI)
                        </div>
                      </SelectItem>
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