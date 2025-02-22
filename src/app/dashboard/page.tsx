import DashboardContent from './DashboardContent';
import AuthCheck from '@/components/auth/AuthCheck';

export default function DashboardPage() {
  return (
    <AuthCheck>
      <DashboardContent />
    </AuthCheck>
  );
}
