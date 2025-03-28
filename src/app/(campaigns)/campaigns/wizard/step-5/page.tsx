import { Suspense } from "react";
import ClientPage from "./ClientPage";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={5} />}>
      <ClientPage />
    </Suspense>
  );
}
