import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Step4Content from "./Step4Content";
import { Metadata } from "next";

// Make the page dynamic to ensure we get fresh data on each visit
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step4Content />
    </Suspense>
  );
}

// Add metadata for better SEO and document title
export const metadata: Metadata = {
  title: "Campaign Creative Assets | Justify.social",
  description: "Upload and manage creative assets for your campaign"
};
