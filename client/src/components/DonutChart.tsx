import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const totalMarkets = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300} data-testid="donut-chart">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0];
              const percentage = ((data.value as number / totalMarkets) * 100).toFixed(1);
              return (
                <div className="bg-card/95 backdrop-blur-sm border border-card-border rounded-lg p-3 shadow-lg">
                  <p className="font-semibold text-foreground mb-1">{data.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.value} {data.value === 1 ? 'market' : 'markets'}
                  </p>
                  <p className="text-sm font-medium text-primary mt-1">
                    {percentage}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
