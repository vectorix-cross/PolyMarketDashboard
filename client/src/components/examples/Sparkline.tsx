import Sparkline from '../Sparkline';
import GlassCard from '../GlassCard';

export default function SparklineExample() {
  const trendData = [45, 48, 52, 49, 55, 58, 62, 59, 65, 68, 72, 70, 75];
  
  return (
    <div className="p-8 bg-background min-h-screen">
      <GlassCard gradient="cyan">
        <h3 className="text-sm text-muted-foreground mb-4">Global Market Sentiment (7d)</h3>
        <Sparkline data={trendData} />
      </GlassCard>
    </div>
  );
}
