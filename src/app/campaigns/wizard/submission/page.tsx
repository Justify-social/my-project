import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import SubmissionContent from "./SubmissionContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SubmissionContent />
    </Suspense>
  );
} 