"use client"

import { useCreateForm } from "@/contexts/CreateFormContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function RecipientPage() {
  const { formData } = useCreateForm()
  const router = useRouter()

  if (!formData) {
    router.push("/create")
    return null
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">STEP 2</div>
          <h1 className="text-2xl font-semibold text-foreground">Recipient</h1>
        </div>

        <div className="space-y-4">
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

          {/* 这里添加接收者表单 */}
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
            >
              Previous Step
            </Button>
            <Button className="w-full">
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 