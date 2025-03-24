// This is a server component that wraps all campaigns-related pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CampaignsLayout({
  children


}: {children: React.ReactNode;}) {
  return (
    <div className="campaigns-layout font-work-sans">
      {children}
    </div>);

}