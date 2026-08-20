"use client";

import React, { createContext, useContext, useState } from "react";
import { UseFormReturn, useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fullAdmissionSchema,
  AdmissionFormData,
} from "@/lib/vaildation/admission";

interface AdmissionContextType {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  form: UseFormReturn<AdmissionFormData>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
}

const AdmissionContext = createContext<AdmissionContextType | undefined>(
  undefined,
);

export function AdmissionProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);

  const form = useForm<AdmissionFormData>({
    resolver: zodResolver(fullAdmissionSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "MALE",
      programApplied: "",
      intendedTerm: "",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof AdmissionFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "gender",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["programApplied", "intendedTerm"];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <AdmissionContext.Provider
      value={{ step, setStep, form, nextStep, prevStep }}
    >
      {/* Wrap children with FormProvider to make useFormContext() work in child steps */}
      <FormProvider {...form}>{children}</FormProvider>
    </AdmissionContext.Provider>
  );
}

export const useAdmission = () => {
  const context = useContext(AdmissionContext);
  if (!context)
    throw new Error("useAdmission must be used within AdmissionProvider");
  return context;
};
