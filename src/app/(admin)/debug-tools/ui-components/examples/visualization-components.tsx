import { 
  LineChart, 
  BarChart, 
  PieChart, 
  AreaChart, 
  RadarChart, 
  ScatterChart, 
  FunnelChart 
} from '@/components/ui';

export default function VisualizationComponentsExample() {
  // Sample data for charts
  const lineData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
    { name: 'Jun', value: 430 }
  ];

  const barData = [
    { name: 'Product A', value: 120 },
    { name: 'Product B', value: 280 },
    { name: 'Product C', value: 380 },
    { name: 'Product D', value: 220 },
    { name: 'Product E', value: 310 }
  ];

  const pieData = [
    { name: 'Category A', value: 400 },
    { name: 'Category B', value: 300 },
    { name: 'Category C', value: 300 },
    { name: 'Category D', value: 200 }
  ];

  const areaData = [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 300 },
    { name: 'Week 3', value: 500 },
    { name: 'Week 4', value: 280 },
    { name: 'Week 5', value: 590 }
  ];

  const radarData = [
    { subject: 'Math', A: 120, B: 110 },
    { subject: 'Science', A: 98, B: 130 },
    { subject: 'Literature', A: 86, B: 130 },
    { subject: 'History', A: 99, B: 100 },
    { subject: 'Geography', A: 85, B: 90 }
  ];

  const scatterData = [
    { x: 10, y: 30, z: 20 },
    { x: 40, y: 50, z: 40 },
    { x: 70, y: 20, z: 60 },
    { x: 30, y: 80, z: 80 },
    { x: 50, y: 90, z: 10 }
  ];

  const funnelData = [
    { name: 'Visitors', value: 5000 },
    { name: 'Leads', value: 3000 },
    { name: 'Opportunities', value: 1200 },
    { name: 'Quotes', value: 800 },
    { name: 'Sales', value: 400 }
  ];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Line Chart</h2>
        <div className="border rounded-lg p-4">
          <LineChart 
            data={lineData} 
            xKey="name" 
            yKey="value" 
            height={300} 
            title="Monthly Sales"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Bar Chart</h2>
        <div className="border rounded-lg p-4">
          <BarChart 
            data={barData} 
            xKey="name" 
            yKey="value" 
            height={300} 
            title="Product Sales"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Pie Chart</h2>
        <div className="border rounded-lg p-4">
          <PieChart 
            data={pieData} 
            nameKey="name" 
            dataKey="value" 
            height={300} 
            title="Sales Distribution"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Area Chart</h2>
        <div className="border rounded-lg p-4">
          <AreaChart 
            data={areaData} 
            xKey="name" 
            yKey="value" 
            height={300} 
            title="Monthly Performance"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Radar Chart</h2>
        <div className="border rounded-lg p-4">
          <RadarChart 
            data={radarData}
            categories={['A', 'B']}
            angleKey="subject"
            height={300} 
            title="Subject Performance"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Scatter Chart</h2>
        <div className="border rounded-lg p-4">
          <ScatterChart 
            data={scatterData} 
            xKey="x" 
            yKey="y" 
            zKey="z" 
            height={300} 
            title="Data Correlation"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Funnel Chart</h2>
        <div className="border rounded-lg p-4">
          <FunnelChart 
            data={funnelData} 
            height={300} 
            title="Sales Funnel"
          />
        </div>
      </section>
    </div>
  );
} 