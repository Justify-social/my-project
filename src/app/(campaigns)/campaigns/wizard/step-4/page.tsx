import { Suspense } from "react";
import ClientPage from "./ClientPage";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import { Metadata } from "next";

// Make the page dynamic to ensure we get fresh data on each visit
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={4} />}>
      <ClientPage />
    </Suspense>
  );
}

// Add metadata for better SEO and document title
export const metadata: Metadata = {
  title: "Campaign Creative Assets | Justify.social",
  description: "Upload and manage creative assets for your campaign"
};
