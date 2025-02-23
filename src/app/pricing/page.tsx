import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PricingContent from "./PricingContent";

export const metadata = {
  title: 'Pricing - Justify',
  description: 'Choose your campaign package',
};

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PricingContent />
    </Suspense>
  );
} 