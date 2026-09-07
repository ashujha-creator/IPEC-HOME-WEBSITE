"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma"; // Import your Prisma Client instance
import { linksSchema, LinksFormValues } from "@/lib/vaildation/links";
import type { Links } from "@/app/generated/prisma/client";
import { cache } from "react";
export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};
export const getLinks = cache(async (): Promise<Links | null> => {
  try {
    const links = await prisma.links.findFirst();
    return links;
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return null;
  }
});
export async function upsertLinks(
  data: LinksFormValues,
): Promise<ActionResult> {
  // 1. Server-side validation
  const validatedFields = linksSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields and try again.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, ...payload } = validatedFields.data;

  try {
    if (id) {
      // Update existing record
      await prisma.links.update({
        where: { id },
        data: payload,
      });
    } else {
      // Create new record or update the single existing record if singleton pattern
      const existingRecord = await prisma.links.findFirst();

      if (existingRecord) {
        await prisma.links.update({
          where: { id: existingRecord.id },
          data: payload,
        });
      } else {
        await prisma.links.create({
          data: payload,
        });
      }
    }

    revalidatePath("/admin/links");

    return {
      success: true,
      message: "Links configured and saved successfully!",
    };
  } catch (error) {
    console.error("Failed to save links:", error);
    return {
      success: false,
      message: "An unexpected database error occurred. Please try again.",
    };
  }
}
