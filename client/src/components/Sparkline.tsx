import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export default function Sparkline({ data, color = "hsl(189 94% 63%)", height = 40 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={height} data-testid="sparkline">
      <LineChart data={chartData}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          dot={false}
          isAnimationActive={true}
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value as number;
              return (
                <div className="bg-card/95 backdrop-blur-sm border border-card-border rounded-lg p-2 shadow-lg">
                  <p className="text-sm font-semibold text-primary">
                    {value.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Probability
                  </p>
                </div>
              );
            }
            return null;
          }}
          cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
