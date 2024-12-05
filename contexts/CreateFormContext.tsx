"use client"

import { createContext, useContext, useState } from "react"
import * as z from "zod"

const formSchema = z.object({
  token: z.string(),
  vestingDuration: z.object({
    value: z.string(),
    unit: z.enum(["month", "year"]),
  }),
  unlockSchedule: z.enum(["weekly", "bi-weekly", "monthly", "quarterly"]),
  startUponCreation: z.boolean(),
  startDate: z.date().optional(),
  startTime: z.string().optional(),
  autoClaim: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

interface CreateFormContextType {
  formData: FormData | null
  setFormData: (data: FormData) => void
}

const CreateFormContext = createContext<CreateFormContextType | undefined>(undefined)

export function CreateFormProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<FormData | null>(null)

  return (
    <CreateFormContext.Provider value={{ formData, setFormData }}>
      {children}
    </CreateFormContext.Provider>
  )
}

export function useCreateForm() {
  const context = useContext(CreateFormContext)
  if (context === undefined) {
    throw new Error("useCreateForm must be used within a CreateFormProvider")
  }
  return context
} 