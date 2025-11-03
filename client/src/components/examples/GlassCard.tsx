import GlassCard from '../GlassCard';

export default function GlassCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background min-h-screen">
      <GlassCard gradient="violet">
        <h3 className="text-lg font-semibold mb-2">Violet Gradient</h3>
        <p className="text-muted-foreground">Glass card with violet neon accent</p>
      </GlassCard>
      <GlassCard gradient="cyan">
        <h3 className="text-lg font-semibold mb-2">Cyan Gradient</h3>
        <p className="text-muted-foreground">Glass card with cyan neon accent</p>
      </GlassCard>
      <GlassCard gradient="magenta">
        <h3 className="text-lg font-semibold mb-2">Magenta Gradient</h3>
        <p className="text-muted-foreground">Glass card with magenta neon accent</p>
      </GlassCard>
      <GlassCard gradient="gold">
        <h3 className="text-lg font-semibold mb-2">Gold Gradient</h3>
        <p className="text-muted-foreground">Glass card with gold neon accent</p>
      </GlassCard>
    </div>
  );
}
