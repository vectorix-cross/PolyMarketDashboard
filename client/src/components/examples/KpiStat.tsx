import KpiStat from '../KpiStat';
import { Activity, TrendingUp, BarChart3, DollarSign } from 'lucide-react';

export default function KpiStatExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-background min-h-screen">
      <KpiStat 
        label="Active Markets" 
        value={1247} 
        gradient="violet"
        delta={5.2}
        icon={<Activity />}
      />
      <KpiStat 
        label="24h Volume" 
        value="$2.4M" 
        gradient="cyan"
        delta={12.5}
        icon={<DollarSign />}
        animate={false}
      />
      <KpiStat 
        label="Top Mover" 
        value="89%" 
        gradient="magenta"
        delta={-3.1}
        icon={<TrendingUp />}
        animate={false}
      />
      <KpiStat 
        label="Avg Liquidity" 
        value="$156K" 
        gradient="gold"
        delta={2.8}
        icon={<BarChart3 />}
        animate={false}
      />
    </div>
  );
}
