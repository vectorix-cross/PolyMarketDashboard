import DonutChart from '../DonutChart';
import GlassCard from '../GlassCard';

export default function DonutChartExample() {
  const categoryData = [
    { name: 'Crypto', value: 420, color: 'hsl(262 90% 68%)' },
    { name: 'Politics', value: 315, color: 'hsl(189 94% 63%)' },
    { name: 'Sports', value: 285, color: 'hsl(320 85% 68%)' },
    { name: 'Other', value: 227, color: 'hsl(45 93% 68%)' }
  ];

  return (
    <div className="p-8 bg-background min-h-screen">
      <GlassCard gradient="violet">
        <h3 className="text-lg font-semibold mb-4">Markets by Category</h3>
        <DonutChart data={categoryData} />
      </GlassCard>
    </div>
  );
}
