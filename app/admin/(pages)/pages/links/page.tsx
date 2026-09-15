export const dynamic = "force-dynamic";
import { getLinks } from "@/app/actions/links";
import { LinkManagementForm } from "@/components/ui/LinkManagementForm";
import { LinksFormValues } from "@/lib/vaildation/links";

export const metadata = {
  title: "Link Management | Admin Portal",
  description: "Configure and update institutional links and resources.",
};

export default async function LinksAdminPage() {
  const existingLinks = await getLinks();

  const formattedData: LinksFormValues | null = existingLinks
    ? ((): LinksFormValues => {
        const { createdAt, updatedAt, ...linksData } = existingLinks;
        return Object.fromEntries(
          Object.entries(linksData).map(([key, value]) => [key, value ?? ""]),
        ) as LinksFormValues;
      })()
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
