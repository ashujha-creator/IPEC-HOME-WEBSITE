"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { linksSchema, LinksFormValues } from "@/lib/vaildation/links";
import type { Links } from "@/app/generated/prisma/client";

export type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// The Links table has exactly one row, ever, pinned to this fixed id.
const SINGLETON_LINKS_ID = "site-links-singleton";

export const getLinks = async (): Promise<Links | null> => {
  try {
    return await prisma.links.findUnique({ where: { id: SINGLETON_LINKS_ID } });
  } catch (error) {
    console.error("Failed to fetch links:", error);
    return null;
  }
};

export async function upsertLinks(
  data: LinksFormValues,
): Promise<ActionResult> {
  const validatedFields = linksSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation failed. Please check the fields and try again.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id: _clientId, ...payload } = validatedFields.data;

  try {
    await prisma.links.upsert({
      where: { id: SINGLETON_LINKS_ID },
      update: payload,
      create: { id: SINGLETON_LINKS_ID, ...payload },
    });

    revalidatePath("/");
    revalidatePath("/admin/pages/links");

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
