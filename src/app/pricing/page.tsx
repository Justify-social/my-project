import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import PricingContent from "./PricingContent";

export const metadata = {
  title: 'Pricing - Justify',
  description: 'Choose your campaign package',
};

export default function Page() {
  return (
    <div className="p-12">
      <h1 className="text-2xl font-bold">Pricing Page Test</h1>
      <p>If you can see this, the route is working!</p>
    </div>
  );
} 