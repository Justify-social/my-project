import { Suspense } from "react";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import ClientPage from "./ClientPage";

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={2} />}>
      <ClientPage />
    </Suspense>
  );
}

export const dynamic = "force-dynamic";
