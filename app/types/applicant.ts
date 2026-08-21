// types/applicant.ts
import { ApplicationStatus, Gender } from "@/app/generated/prisma/client";

export { ApplicationStatus, Gender };

export interface Applicant {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | string;
  gender: Gender;
  programApplied: string;
  intendedTerm: string;
  status: ApplicationStatus;
}

export interface ApplicantFilters {
  search: string;
  status: ApplicationStatus | "ALL";
  gender: Gender | "ALL";
  program: string;
  year: string | null | undefined;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: "createdAt" | "firstName" | "lastName";
  sortOrder: "asc" | "desc";
}
