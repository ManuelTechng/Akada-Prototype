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
    <div className="relative overflow-hidden rounded-[26px] bg-gray-900/40 backdrop-blur-2xl border border-white/10 p-5 sm:p-7 lg:p-8 shadow-[0_26px_60px_-38px_rgba(12,22,52,0.85)] group hover:translate-y-[-6px] transition-all cursor-pointer h-[170px] sm:h-[190px] lg:h-[210px] flex flex-col justify-between">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accentColor]}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_60%)]" />
      
      {/* Animated glow on hover */}
      <div className="absolute top-[-40px] right-[-40px] w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-[72px]`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-3">
        <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">{value}</div>
        <div className="text-sm sm:text-base text-white/75 leading-snug max-w-[80%]">{label}</div>
      </div>
      
      {/* Decorative corner shine */}
  <div className="absolute bottom-[-60px] right-[-60px] h-40 w-40 rounded-full border border-white/10 bg-white/10 blur-[90px]" />
  <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/15 rounded-tl-full" />
    </div>
  );
}