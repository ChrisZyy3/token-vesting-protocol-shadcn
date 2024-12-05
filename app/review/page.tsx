'use client';

import { useEffect } from 'react';
import { useRouter } from "next/navigation"
import { useCreateForm } from "@/contexts/CreateFormContext"

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Review() {
  const router = useRouter()
  const { formData, recipients } = useCreateForm()

  useEffect(() => {
    if (!formData || !recipients) {
      router.push("/create")
    }
  }, [formData, recipients, router])

  if (!formData || !recipients) {
    return null
  }

  const handleCreateContract = () => {
    console.log('Contract Details:', {
      formData,
      recipients,
      recipientCount: recipients.recipients.length,
      totalAmount: recipients.totalVested,
      remainingBalance: recipients.remainingBalance
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">STEP 3</div>
          <h1 className="text-2xl font-semibold text-foreground">Review</h1>
        </div>

        {/* Contract Summary */}
        <Card className="space-y-6 p-6">
          <div>
            <h2 className="mb-4 text-lg font-medium">Contract Summary</h2>
            <dl className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Token:</dt>
                <dd className="flex items-center gap-2">
                  <span>{formData.token.split("::").pop()}</span>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>To be Vested:</dt>
                <dd>{recipients.totalVested}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Remaining Balance:</dt>
                <dd>{recipients.remainingBalance}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Recipients:</dt>
                <dd>{recipients.recipients.length}</dd>
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

          <div>
            <h2 className="mb-4 text-lg font-medium">Recipients</h2>
            <div className="space-y-4">
              {recipients.recipients.map((recipient, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span>{recipient.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wallet Address</span>
                      <span className="text-sm">{recipient.walletAddress}</span>
                    </div>
                    {recipient.contractTitle && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contract Title</span>
                        <span>{recipient.contractTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

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
            onClick={handleCreateContract}
          >
            Create Contract
          </Button>
        </div>
      </div>
    </div>
  )
}

