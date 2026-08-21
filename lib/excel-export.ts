// lib/excel-export.ts
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Applicant } from "@/app/types/applicant";

export function exportApplicantsToExcel(
  applicants: Applicant[],
  filename = "Applicants_Export.xlsx",
) {
  if (!applicants || applicants.length === 0) {
    return;
  }

  // Format data for spreadsheet presentation
  const formattedData = applicants.map((app) => ({
    "Applicant ID": app.id,
    "First Name": app.firstName,
    "Last Name": app.lastName,
    Email: app.email,
    Phone: app.phone,
    Gender: app.gender,
    "Date of Birth": app.dateOfBirth
      ? format(new Date(app.dateOfBirth), "yyyy-MM-dd")
      : "",
    "Program Applied": app.programApplied,
    "Intended Term": app.intendedTerm,
    Status: app.status,
    "Application Date": app.createdAt
      ? format(new Date(app.createdAt), "yyyy-MM-dd HH:mm")
      : "",
  }));

  // Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");

  // Dynamically calculate optimal column widths
  const maxWidths = Object.keys(formattedData[0]).map((key) => {
    let maxLen = key.length;
    formattedData.forEach((row) => {
      const cellValue = String(row[key as keyof typeof row] || "");
      if (cellValue.length > maxLen) {
        maxLen = cellValue.length;
      }
    });
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) }; // min 12, max 40 chars
  });

  worksheet["!cols"] = maxWidths;

  // Trigger browser download
  XLSX.writeFile(workbook, filename);
}
