import MarketCard from '../MarketCard';

export default function MarketCardExample() {
  const markets = [
    {
      id: "1",
      title: "Will Bitcoin reach $100,000 by end of 2025?",
      probability: 67,
      delta24h: 5.2,
      category: "Crypto",
      liquidity: 245000
    },
    {
      id: "2",
      title: "Will there be a recession in the US in 2025?",
      probability: 42,
      delta24h: -3.1,
      category: "Politics",
      liquidity: 180000
    },
    {
      id: "3",
      title: "Will SpaceX successfully land on Mars in 2025?",
      probability: 12,
      delta24h: 8.4,
      category: "Science",
      liquidity: 95000
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-background min-h-screen">
      {markets.map(market => (
        <MarketCard 
          key={market.id} 
          {...market} 
          onClick={() => console.log('Market clicked:', market.id)}
        />
      ))}
    </div>
  );
}
