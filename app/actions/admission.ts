// app/actions/admission.ts
"use server";

import {
  fullAdmissionSchema,
  AdmissionFormData,
} from "@/lib/vaildation/admission";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export type SubmissionResult =
  { success: true; applicationId: string } | { success: false; error: string };

export async function submitAdmissionApplication(
  rawData: AdmissionFormData,
): Promise<SubmissionResult> {
  try {
    // 1. Validate payload on the server
    const validatedData = fullAdmissionSchema.parse(rawData);

    // 2. Perform transactional database write
    const application = await prisma.$transaction(async (tx) => {
      // Check for duplicate application by email
      const existingApplicant = await tx.applicant.findUnique({
        where: { email: validatedData.email },
      });

      if (existingApplicant) {
        throw new Error(
          "An application with this email address already exists.",
        );
      }

      // Create applicant along with related education records and uploaded documents
      const newApplicant = await tx.applicant.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          dateOfBirth: new Date(validatedData.dateOfBirth),
          gender: validatedData.gender,
          programApplied: validatedData.programApplied,
          intendedTerm: validatedData.intendedTerm,
          status: "SUBMITTED",
        },
      });

      return newApplicant;
    });

    return { success: true, applicationId: application.id };
  } catch (error) {
    console.error("Submission Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to submit application.",
    };
  }
}
