import { Suspense } from "react";
import { WizardSkeleton } from "@/components/ui/loading-skeleton";
import SubmissionContent from "./SubmissionContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<WizardSkeleton step={5} />}>
      <SubmissionContent />
    </Suspense>
  );
} 