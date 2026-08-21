// components/applicants/applicant-status-badge.tsx
import React from "react";
import { ApplicationStatus } from "@/app/types/applicant";
import { Badge } from "@/components/ui/badge";

interface ApplicantStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicantStatusBadge({ status }: ApplicantStatusBadgeProps) {
  if (status === "SUBMITTED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
        Submitted
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
      Draft
    </Badge>
  );
}