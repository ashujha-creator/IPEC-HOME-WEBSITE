"use client";

import React, { useState } from "react";
import { useFormContext, useFieldArray, FieldPath } from "react-hook-form";
import {
  User,
  GraduationCap,
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  UploadCloud,
  AlertCircle,
} from "lucide-react";
import { useAdmission } from "@/components/context/admission-context";
import { AdmissionFormData } from "@/lib/vaildation/admission";

// --- Step Progress Indicator ---
function StepProgress() {
  const { step } = useAdmission();

  const steps = [
    { id: 1, name: "Personal Details", icon: User },
    { id: 2, name: "Academic History", icon: GraduationCap },
  ] as const;

  return (
    <nav aria-label="Progress" className="w-full mb-8">
      <ol
        role="list"
        className="flex items-center justify-between max-w-2xl mx-auto px-4"
      >
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isCompleted = step > s.id;
          const isCurrent = step === s.id;

          return (
            <li key={s.id} className="relative flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors border-2 ${
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : isCurrent
                        ? "border-primary text-primary bg-background"
                        : "border-muted text-muted-foreground bg-muted/30"
                  }`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium hidden sm:block ${
                    isCurrent
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {s.name}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-full mx-2 sm:mx-4 transition-colors ${
                    step > s.id ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// --- Step 1: Personal Details ---
function PersonalInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<AdmissionFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Personal Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide your legal contact and demographic information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First Name <span className="text-destructive">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Jane"
          />
          {errors.firstName?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last Name <span className="text-destructive">*</span>
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Doe"
          />
          {errors.lastName?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.lastName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="jane.doe@example.com"
          />
          {errors.email?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+1 (555) 000-0000"
          />
          {errors.phone?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="dateOfBirth" className="text-sm font-medium">
            Date of Birth <span className="text-destructive">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {errors.dateOfBirth?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="gender" className="text-sm font-medium">
            Gender <span className="text-destructive">*</span>
          </label>
          <select
            id="gender"
            {...register("gender")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.gender.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Step 2: Academic History ---
function AcademicInfoStep() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<AdmissionFormData>();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          Program & Academic Background
        </h3>
        <p className="text-sm text-muted-foreground">
          Select your intended major and list your previous academic
          credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b">
        <div className="space-y-2">
          <label htmlFor="programApplied" className="text-sm font-medium">
            Program Applied For <span className="text-destructive">*</span>
          </label>
          <select
            id="programApplied"
            {...register("programApplied")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a Program</option>
            <option value="BTECH_IN_COMPUTER_SCIENCE">
              B-TECH IN COMPUTER SCIENCE
            </option>
            <option value="BTECH_AI">BTECH IN AI</option>
            <option value="MTECH_IN_AI">MTECH IN AI</option>
            <option value="MTECH_IN_COMPUTER_SCIENCE">MTECH IN SCIENCE</option>
            <option value="BBA">B.B.A</option>
          </select>
          {errors.programApplied?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />{" "}
              {errors.programApplied.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="intendedTerm" className="text-sm font-medium">
            Intended Term <span className="text-destructive">*</span>
          </label>
          <select
            id="intendedTerm"
            {...register("intendedTerm")}
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select Intended Term</option>
            <option value="FALL_2026">Fall 2026</option>
            <option value="SPRING_2027">Spring 2027</option>
          </select>
          {errors.intendedTerm?.message && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.intendedTerm.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Form Component ---
export default function AdmissionFormWrapper({
  onSubmit,
  isSubmitting = false,
}: {
  onSubmit: (data: AdmissionFormData) => void;
  isSubmitting?: boolean;
}) {
  const { step, form, nextStep, prevStep } = useAdmission();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
      <StepProgress />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {step === 1 && <PersonalInfoStep />}
        {step === 2 && <AcademicInfoStep />}

        <div className="flex items-center justify-between pt-6 border-t">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
