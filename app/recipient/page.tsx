'use client';

import { useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Recipient {
  id: number
  amount: string
  walletAddress: string
  contractTitle: string
  emailAddress: string
}

export default function Recipients() {
  const router = useRouter()
  const { formData } = useCreateForm()
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: 1,
      amount: '',
      walletAddress: '',
      contractTitle: '',
      emailAddress: '',
    },
  ])
  const [remainingAmount] = useState('0.4037 SUI')

  if (!formData) {
    router.push("/create")
    return null
  }

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      {
        id: recipients.length + 1,
        amount: '',
        walletAddress: '',
        contractTitle: '',
        emailAddress: '',
      },
    ])
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">STEP 2</div>
          <h1 className="text-2xl font-semibold text-foreground">Recipients</h1>
        </div>

        {/* Schedule Summary */}
        <div className="rounded-lg border border-input bg-card p-4">
          <h2 className="mb-2 font-medium text-foreground">Schedule Summary</h2>
          <dl className="space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <dt>Token:</dt>
              <dd>SUI</dd>
            </div>
            <div className="flex justify-between">
              <dt>Duration:</dt>
              <dd>{formData.vestingDuration.value} {formData.vestingDuration.unit}(s)</dd>
            </div>
            <div className="flex justify-between">
              <dt>Unlock Schedule:</dt>
              <dd>{formData.unlockSchedule}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Start Upon Creation:</dt>
              <dd>{formData.startUponCreation ? "Yes" : "No"}</dd>
            </div>
            {!formData.startUponCreation && formData.startDate && (
              <div className="flex justify-between">
                <dt>Start Date:</dt>
                <dd>{formData.startDate.toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <Collapsible
              key={recipient.id}
              className="overflow-hidden rounded-lg border border-input bg-card"
              defaultOpen
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground">
                <span className="text-foreground">Recipient {recipient.id}</span>
                <ChevronDown className="size-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Amount</Label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Remaining Amount</span>
                        <div className="flex items-center gap-1">
                          <div className="size-4 rounded-full bg-blue-500" />
                          <span>{remainingAmount}</span>
                        </div>
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="border-input bg-background"
                      value={recipient.amount}
                      onChange={(e) => {
                        const newRecipients = [...recipients]
                        newRecipients[index].amount = e.target.value
                        setRecipients(newRecipients)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Recipient Wallet Address</Label>
                    <div className="relative">
                      <Input
                        placeholder="Please double check the address"
                        className="border-input bg-background pr-20"
                        value={recipient.walletAddress}
                        onChange={(e) => {
                          const newRecipients = [...recipients]
                          newRecipients[index].walletAddress = e.target.value
                          setRecipients(newRecipients)
                        }}
                      />
                      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-accent hover:text-accent-foreground"
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:bg-accent hover:text-accent-foreground"
                        >
                          <ArrowUpRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Make sure this is not a centralized exchange address.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Contract Title <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      placeholder="e.g. VC Seed Round"
                      className="border-input bg-background"
                      value={recipient.contractTitle}
                      onChange={(e) => {
                        const newRecipients = [...recipients]
                        newRecipients[index].contractTitle = e.target.value
                        setRecipients(newRecipients)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Recipient Email Address <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <Input
                      type="email"
                      placeholder="Optional email to notify"
                      className="border-input bg-background"
                      value={recipient.emailAddress}
                      onChange={(e) => {
                        const newRecipients = [...recipients]
                        newRecipients[index].emailAddress = e.target.value
                        setRecipients(newRecipients)
                      }}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            className="text-primary hover:bg-primary/10 hover:text-primary"
            onClick={addRecipient}
          >
            + Add Recipient
          </Button>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Previous Step
          </Button>
          <Button className="w-full" size="lg">
            Review Contract
          </Button>
        </div>
      </div>
    </div>
  )
}