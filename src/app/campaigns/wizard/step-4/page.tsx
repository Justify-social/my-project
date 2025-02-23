import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Step4Content from "./Step4Content";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step4Content />
    </Suspense>
  );
}
