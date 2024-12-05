'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"
import { useToast } from "../../hooks/use-toast"

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CategorizedObjects,
  calculateTotalBalance,
  formatBalance,
} from "@/utils/assetsHelpers"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { suiClient } from "@/config"
import { getUserProfile } from "../../lib/contracts"


interface Recipient {
  id: number
  amount: string
  walletAddress: string
  contractTitle: string
  emailAddress: string
}

export default function Recipients() {
  const router = useRouter()
  const { formData, recipients: contextRecipients, setFormRecipients } = useCreateForm()
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: 1,
      amount: '',
      walletAddress: '',
      contractTitle: '',
      emailAddress: '',
    },
  ])

  const account = useCurrentAccount()
  const [userObjects, setUserObjects] = useState<CategorizedObjects | null>(null)

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

  const [remainingAmount, setRemainingAmount] = useState(formData?.tokenBalance || '0')

  const updateRemainingAmount = (newRecipients: Recipient[]) => {
    const totalAllocated = newRecipients.reduce((sum, recipient) => {
      return sum + (parseFloat(recipient.amount) || 0)
    }, 0)
    const newRemainingAmount = (parseFloat(formData?.tokenBalance || '0') - totalAllocated).toFixed(9)
    setRemainingAmount(newRemainingAmount)
  }

  const [openRecipientId, setOpenRecipientId] = useState<number>(1);

  const { toast } = useToast()

  const handleAmountChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    const parsedValue = parseFloat(value);
    const currentTotal = recipients.reduce((sum, r, i) =>
      i !== index ? sum + (parseFloat(r.amount) || 0) : sum, 0
    );

    const totalAmount = parsedValue + currentTotal;
    const maxAmount = parseFloat(formData?.tokenBalance || '0');

    if (parsedValue < 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Amount cannot be negative.",
      })
      return;
    }

    if (totalAmount > maxAmount) {
      toast({
        variant: "destructive",
        title: "Insufficient balance",
        description: `Total amount cannot exceed ${maxAmount}`,
      })
      return;
    }

    newRecipients[index].amount = value;
    setRecipients(newRecipients);
    updateRemainingAmount(newRecipients);
  }

  useEffect(() => {
    if (!formData) {
      router.push("/create")
      return
    }
  }, [formData, router])

  const addRecipient = () => {
    setOpenRecipientId(recipients.length + 1);

    const newRecipients = [
      ...recipients,
      {
        id: recipients.length + 1,
        amount: '',
        walletAddress: '',
        contractTitle: '',
        emailAddress: '',
      },
    ];
    setRecipients(newRecipients);
  }

  const handleReview = () => {
    // 验证所有必填字段
    const isValid = recipients.every(r => r.amount && r.walletAddress)

    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields for each recipient",
      })
      return
    }

    // 计算总额
    const totalVested = recipients.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)

    // 提交到 Context
    const recipientsData = {
      recipients: recipients.map(r => ({
        amount: r.amount,
        walletAddress: r.walletAddress,
        contractTitle: r.contractTitle
      })),
      totalVested: totalVested.toFixed(9),
      remainingBalance: remainingAmount
    }

    setFormRecipients(recipientsData)
    router.push("/review")
  }

  // 从 Context 恢复数据
  useEffect(() => {
    if (contextRecipients) {
      const restoredRecipients = contextRecipients.recipients.map((r, index) => ({
        id: index + 1,
        amount: r.amount,
        walletAddress: r.walletAddress,
        contractTitle: r.contractTitle,
        emailAddress: '', // Context 中没有存这个字段，保持为空
      }))
      setRecipients(restoredRecipients)
      setRemainingAmount(contextRecipients.remainingBalance)
    }
  }, [contextRecipients])

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
              <dd className="flex items-center gap-2">
                <span>{formData?.token.split("::").pop()}</span>
                <span>({formData?.tokenBalance})</span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt>Duration:</dt>
              <dd>{formData?.vestingDuration.value} {formData?.vestingDuration.unit}(s)</dd>
            </div>
            <div className="flex justify-between">
              <dt>Unlock Schedule:</dt>
              <dd>{formData?.unlockSchedule}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Start Upon Creation:</dt>
              <dd>{formData?.startUponCreation ? "Yes" : "No"}</dd>
            </div>
            {!formData?.startUponCreation && formData?.startDate && (
              <div className="flex justify-between">
                <dt>Start Date:</dt>
                <dd>{formData?.startDate.toLocaleDateString()}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <Collapsible
              key={recipient.id}
              className="overflow-hidden rounded-lg border border-input bg-card"
              open={recipient.id === openRecipientId}
              onOpenChange={(open) => {
                if (open) {
                  setOpenRecipientId(recipient.id);
                }
              }}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent hover:text-accent-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-foreground">Recipient {recipient.id}</span>
                  {recipient.amount && (
                    <span className="text-sm text-muted-foreground">
                      ({recipient.amount})
                    </span>
                  )}
                </div>
                {recipient.id === openRecipientId ? (
                  <ChevronUp className="size-4" />
                ) : (
                    <ChevronDown className="size-4" />
                )}
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
                      onChange={(e) => handleAmountChange(index, e.target.value)}
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
          <Button
            className="w-full"
            size="lg"
            onClick={handleReview}
          >
            Review Contract
          </Button>
        </div>
      </div>
    </div>
  )
}