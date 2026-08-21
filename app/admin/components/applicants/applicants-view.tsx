// components/applicants/applicants-view.tsx
"use client";

import React, { useState } from "react";
import { format, isValid } from "date-fns";
import { ApplicantFilters } from "@/app/types/applicant";
import { useApplicants } from "../../../../hooks/use-applicants";
import { ApplicantFilterBar } from "./applicant-filter-bar";
import { ApplicantStatusBadge } from "./applicant-status-badge";
import { ApplicantPagination } from "./applicant-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const initialFilters: ApplicantFilters = {
  search: "",
  status: "ALL",
  gender: "ALL",
  program: "",
  year: "ALL",
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const formatDateSafe = (
  dateString?: string | Date,
  formatStr = "MMM dd, yyyy",
) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, formatStr) : "Invalid Date";
};

export function ApplicantsView() {
  const [filters, setFilters] = useState<ApplicantFilters>(initialFilters);

  const { data, isLoading, isError, error, isFetching } =
    useApplicants(filters);

  const handleFilterChange = (updated: Partial<ApplicantFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
  };

  const toggleSort = (field: "firstName" | "createdAt") => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder:
        prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const applicantsList = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Admissions Applicants
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, filter, and review prospective student applications.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <ApplicantFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Main Content Area */}
      {isError ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {error?.message ||
                "Failed to load applicant records. Please try again."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[220px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("firstName")}
                      className="-ml-3 h-8 text-xs font-semibold"
                    >
                      Applicant Name
                      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Program & Term</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort("createdAt")}
                      className="-mr-3 h-8 text-xs font-semibold"
                    >
                      Applied Date
                      <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: filters.limit }).map((_, i) => (
                    <TableRow key={`skeleton-row-${i}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : applicantsList.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No applicants found matching your current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  applicantsList.map((applicant) => (
                    <TableRow
                      key={applicant.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {applicant.firstName} {applicant.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {applicant.email}
                          </span>
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {applicant.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            {applicant.programApplied}
                          </span>
                          <span className="text-muted-foreground">
                            {applicant.intendedTerm}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs capitalize">
                        {applicant.gender?.toLowerCase() ?? "n/a"}
                      </TableCell>
                      <TableCell>
                        <ApplicantStatusBadge status={applicant.status} />
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatDateSafe(applicant.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-border">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-card-${i}`} className="p-4 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : applicantsList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No applicants found matching your current filters.
              </div>
            ) : (
              applicantsList.map((applicant) => (
                <div key={applicant.id} className="p-4 space-y-3 bg-card">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-base">
                        {applicant.firstName} {applicant.lastName}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
                        {applicant.programApplied} • {applicant.intendedTerm}
                      </p>
                    </div>
                    <ApplicantStatusBadge status={applicant.status} />
                  </div>

                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 shrink-0" /> {applicant.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 shrink-0" /> {applicant.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" /> Applied:{" "}
                      {formatDateSafe(applicant.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer / Pagination */}
          {meta && (
            <div className="border-t border-border bg-card">
              <ApplicantPagination
                currentPage={meta.currentPage}
                totalPages={meta.totalPages}
                totalCount={meta.totalCount}
                limit={meta.limit}
                onPageChange={(page) => handleFilterChange({ page })}
                onLimitChange={(limit) =>
                  handleFilterChange({ limit, page: 1 })
                }
                isFetching={isFetching}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
