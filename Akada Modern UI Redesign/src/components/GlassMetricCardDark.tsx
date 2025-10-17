interface GlassMetricCardDarkProps {
  value: string | number;
  label: string;
  accentColor: string;
}

export function GlassMetricCardDark({ value, label, accentColor }: GlassMetricCardDarkProps) {
  const colorMap: Record<string, string> = {
    green: 'from-green-500/30 to-emerald-500/20',
    blue: 'from-blue-500/30 to-cyan-500/20',
    purple: 'from-purple-500/30 to-pink-500/20',
    orange: 'from-orange-500/30 to-red-500/20',
  };

  const glowMap: Record<string, string> = {
    green: 'bg-green-500/40',
    blue: 'bg-blue-500/40',
    purple: 'bg-purple-500/40',
    orange: 'bg-orange-500/40',
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-xl group hover:scale-105 transition-all cursor-pointer h-[180px] flex flex-col justify-center">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accentColor]}`} />
      
      {/* Animated glow on hover */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-2xl`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="text-4xl text-white mb-2">{value}</div>
        <div className="text-gray-300 text-sm">{label}</div>
      </div>
      
      {/* Decorative corner shine */}
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-tl-full" />
    </div>
  );
}
