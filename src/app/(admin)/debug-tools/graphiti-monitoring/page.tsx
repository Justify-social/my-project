import { Metadata } from 'next';
import GraphitiDashboard from '@/components/features/admin/graphiti-dashboard/GraphitiDashboard';

export const metadata: Metadata = {
  title: 'Graphiti Knowledge Graph Monitoring',
  description: 'Monitor the usage and health of your Graphiti knowledge graph integration',
};

export default function GraphitiMonitoringPage() {
  return (
    <div className="container mx-auto py-8">
      <GraphitiDashboard />
    </div>
  );
} 