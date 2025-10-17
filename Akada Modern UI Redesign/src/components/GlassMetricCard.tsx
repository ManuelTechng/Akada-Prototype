interface GlassMetricCardProps {
  value: string | number;
  label: string;
  accentColor: string;
}

export function GlassMetricCard({ value, label, accentColor }: GlassMetricCardProps) {
  const colorMap: Record<string, string> = {
    green: 'from-emerald-50 to-green-50',
    blue: 'from-blue-50 to-cyan-50',
    purple: 'from-purple-50 to-pink-50',
    orange: 'from-orange-50 to-amber-50',
  };

  const borderMap: Record<string, string> = {
    green: 'border-emerald-200',
    blue: 'border-blue-200',
    purple: 'border-purple-200',
    orange: 'border-orange-200',
  };

  const glowMap: Record<string, string> = {
    green: 'bg-emerald-300/20',
    blue: 'bg-blue-300/20',
    purple: 'bg-purple-300/20',
    orange: 'bg-orange-300/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-xl border ${borderMap[accentColor]} p-6 shadow-sm group hover:shadow-md hover:scale-105 transition-all cursor-pointer`}>
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accentColor]}`} />
      
      {/* Animated glow on hover */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-2xl`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl text-gray-900 mb-2">{value}</div>
        <div className="text-gray-600 text-sm">{label}</div>
      </div>
      
      {/* Decorative corner shine */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/30 rounded-tl-full" />
    </div>
  );
}
