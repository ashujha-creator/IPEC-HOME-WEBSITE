import { prisma } from "@/lib/prisma";
import { LinkManagementForm } from "@/components/ui/LinkManagementForm";
import { LinksFormValues } from "@/lib/vaildation/links";

export const metadata = {
  title: "Link Management | Admin Portal",
  description: "Configure and update institutional links and resources.",
};

export default async function LinksAdminPage() {
  // Fetch existing links entry (using first record as single configuration document)
  const existingLinks = await prisma.links.findFirst();

  // Map null values to empty strings to avoid React uncontrolled-to-controlled input warnings
  const formattedData: LinksFormValues | null = existingLinks
    ? Object.entries(existingLinks).reduce((acc, [key, value]) => {
        acc[key as keyof LinksFormValues] = (value as string) ?? "";
        return acc;
      }, {} as LinksFormValues)
    : null;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage all public and internal URL redirects across the portal.
        </p>
      </div>

      <LinkManagementForm initialData={formattedData} />
    </div>
  );
}