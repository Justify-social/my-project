"use client";
import dynamic from 'next/dynamic';

const BrandLiftReportContent = dynamic(
  () => import('@/components/brand-lift/BrandLiftReportContent'),
  {
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function ReportPage() {
  return <BrandLiftReportContent />;
}
