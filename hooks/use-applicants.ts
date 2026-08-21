// hooks/use-applicants.ts
"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getApplicants,
  PaginatedApplicantsResponse,
} from "@/app/actions/applicants";
import { ApplicantFilters } from "@/app/types/applicant";

export function useApplicants(filters: ApplicantFilters) {
  return useQuery<PaginatedApplicantsResponse, Error>({
    queryKey: ["applicants", filters],
    queryFn: async () => {
      const response = await getApplicants({
        search: filters.search || undefined,
        status: filters.status === "ALL" ? undefined : filters.status,
        gender: filters.gender === "ALL" ? undefined : filters.gender,
        program: filters.program || undefined,
        year:
          filters.year && filters.year !== "ALL"
            ? parseInt(filters.year, 10)
            : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      return response;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes cache validity
  });
}
