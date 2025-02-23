import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PricingContent from "./PricingContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PricingContent />
    </Suspense>
  );
} 