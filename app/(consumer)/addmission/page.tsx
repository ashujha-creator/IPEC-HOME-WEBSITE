// app/admission/page.tsx
"use client";

import React, { useState } from "react";
import { AdmissionProvider } from "@/components/context/admission-context";
import AdmissionFormWrapper from "./component/admission";
import { AdmissionFormData } from "@/lib/vaildation/admission";
import { submitAdmissionApplication } from "@/app/actions/admission";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import Image from "next/image";

export default function AdmissionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (data: AdmissionFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await submitAdmissionApplication(data);

    setIsSubmitting(false);

    if (result.success) {
      setSubmittedId(result.applicationId);
    } else {
      setErrorMessage(result.error);
    }
  };

  if (submittedId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md w-full p-6 bg-card border rounded-xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold">Application Submitted!</h2>
          <p className="text-sm text-muted-foreground">
            Thank you for applying. Your official reference ID is:
          </p>
          <div className="p-2 bg-muted rounded font-mono text-sm font-semibold select-all">
            {submittedId}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 py-5 px-4">
      <div className="max-w-3xl mx-auto mb-6 text-center justify-center align-middle">
        <span className="flex justify-center">
          <Image
            src={"/logo.png"}
            width={500}
            height={500}
            alt="logo"
            loading="eager"
            className="w-auto h-auto"
          />
        </span>{" "}
      </div>

      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-6 p-4 border border-destructive/50 bg-destructive/10 text-destructive text-sm rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <AdmissionProvider>
        <AdmissionFormWrapper
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </AdmissionProvider>
    </div>
  );
}
