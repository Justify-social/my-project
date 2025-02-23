import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Step5Content from "./Step5Content";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Step5Content />
    </Suspense>
  );
}
