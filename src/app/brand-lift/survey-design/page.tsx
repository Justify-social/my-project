"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SurveyDesignContent from "@/components/Brand-Lift/SurveyDesignContent";

export default function SurveyDesignPage() {
  const router = useRouter();
  // Flag to indicate client mount to avoid SSR mismatches
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="p-8 font-['Work_Sans'] text-[var(--primary-color)] font-work-sans">Loading...</div>;
  }

  return <SurveyDesignContent />;
}