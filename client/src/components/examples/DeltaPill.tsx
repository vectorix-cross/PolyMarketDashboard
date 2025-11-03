import DeltaPill from '../DeltaPill';

export default function DeltaPillExample() {
  return (
    <div className="flex flex-wrap gap-3 p-8 bg-background min-h-screen items-start">
      <DeltaPill value={12.5} />
      <DeltaPill value={5.2} />
      <DeltaPill value={0.8} />
      <DeltaPill value={-3.1} />
      <DeltaPill value={-8.4} />
      <DeltaPill value={0} />
      <DeltaPill value={24.7} />
      <DeltaPill value={-15.2} />
    </div>
  );
}
