import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Step1ContentLoader from "./Step1ContentLoader";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step1ContentLoader />
    </Suspense>
  );
}

export const dynamic = "force-dynamic"; // Critical for proper client-side rendering