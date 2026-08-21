// components/applicants/applicant-filter-bar.tsx
"use client";

import React, { useState } from "react";
import {
  Applicant,
  ApplicantFilters,
  ApplicationStatus,
  Gender,
} from "@/app/types/applicant";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Search, RotateCcw, Loader2 } from "lucide-react";
import { exportApplicantsToExcel } from "@/lib/excel-export";
import { getAllApplicantsForExport } from "@/app/actions/applicants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApplicantFilterBarProps {
  filters: ApplicantFilters;
  currentPageData?: Applicant[];
  onFilterChange: (updated: Partial<ApplicantFilters>) => void;
  onReset: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) =>
  (currentYear - i).toString(),
);

export function ApplicantFilterBar({
  filters,
  currentPageData = [],
  onFilterChange,
  onReset,
}: ApplicantFilterBarProps) {
  const [isExporting, setIsExporting] = useState(false);
  // Handle Current Page Export
  const handleExportCurrentPage = () => {
    exportApplicantsToExcel(
      currentPageData,
      `Applicants_Page_${filters.page}_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  // Handle Full Dataset Export (Server Fetch)
  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      const allData = await getAllApplicantsForExport({
        search: filters.search || undefined,
        status: filters.status === "ALL" ? undefined : filters.status,
        gender: filters.gender === "ALL" ? undefined : filters.gender,
        program: filters.program || undefined,
        year:
          filters.year && filters.year !== "ALL"
            ? parseInt(filters.year, 10)
            : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      exportApplicantsToExcel(
        allData,
        `Applicants_Filtered_Export_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, phone..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ search: e.target.value, page: 1 })
            }
            className="pl-9"
          />
        </div>

        {/* Application Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(val) =>
            onFilterChange({
              status: val as ApplicationStatus | "ALL",
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="SUBMITTED">Submitted</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>

        {/* Gender Filter */}
        <Select
          value={filters.gender}
          onValueChange={(val) =>
            onFilterChange({ gender: val as Gender | "ALL", page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Genders</SelectItem>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
          </SelectContent>
        </Select>

        {/* Application Year Filter */}
        <Select
          value={filters.year}
          onValueChange={(val) => onFilterChange({ year: val, page: 1 })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Application Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Years</SelectItem>
            {yearOptions.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export Buttons */}
      </div>

      <div className="flex justify-end pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground text-xs gap-1"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs font-medium"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              Export to Excel
            </Button>
          }
        ></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportCurrentPage}>
            Export Current Page ({currentPageData.length} items)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportAll}>
            Export All Filtered Records
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
