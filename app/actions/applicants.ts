// app/actions/applicants.ts
"use server";

import { PrismaClient, ApplicationStatus, Gender, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export interface GetApplicantsParams {
  search?: string;
  status?: ApplicationStatus;
  gender?: Gender;
  program?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "firstName" | "lastName";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedApplicantsResponse {
  data: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: Date;
    gender: Gender;
    programApplied: string;
    intendedTerm: string;
    status: ApplicationStatus;
  }>;
  meta: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getApplicants(
  params: GetApplicantsParams = {}
): Promise<PaginatedApplicantsResponse> {
  try {
    const {
      search,
      status,
      gender,
      program,
      year,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;

    // Build dynamic Prisma filter conditions
    const where: Prisma.ApplicantWhereInput = {};

    if (search && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (program) where.programApplied = { contains: program, mode: "insensitive" };

    // Filtering by year or custom date range on `createdAt`
    if (year) {
      where.createdAt = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    } else if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Parallel execution for optimal performance
    const [totalCount, applicants] = await Promise.all([
      prisma.applicant.count({ where }),
      prisma.applicant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      data: applicants,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching applicants:", error);
    throw new Error("Failed to fetch applicant records.");
  }
}

// app/actions/applicants.ts (Add to existing file)

export async function getAllApplicantsForExport(
  params: Omit<GetApplicantsParams, "page" | "limit"> = {}
) {
  try {
    const { search, status, gender, program, year, startDate, endDate, sortBy = "createdAt", sortOrder = "desc" } = params;

    const where: Prisma.ApplicantWhereInput = {};

    if (search && search.trim() !== "") {
      const query = search.trim();
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (program) where.programApplied = { contains: program, mode: "insensitive" };

    if (year) {
      where.createdAt = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    } else if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const applicants = await prisma.applicant.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
    });

    return applicants;
  } catch (error) {
    console.error("Error exporting applicants:", error);
    throw new Error("Failed to generate export data.");
  }
}