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
    <div className="relative overflow-hidden rounded-[28px] bg-gray-900/45 backdrop-blur-2xl border border-white/10 px-5 py-6 sm:px-6 sm:py-7 shadow-[0_30px_60px_-40px_rgba(14,24,54,0.9)] group hover:translate-y-[-6px] transition-all cursor-pointer min-h-[180px] max-w-[230px] min-w-[210px] flex flex-col justify-between">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accentColor]}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.15),transparent_58%)]" />
      
      {/* Animated glow on hover */}
      <div className="absolute top-[-46px] right-[-46px] w-36 h-36 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-[72px]`} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 space-y-3">
        <div className="text-[2.4rem] sm:text-[2.8rem] font-semibold text-white tracking-tight leading-none">{value}</div>
        <div className="text-sm sm:text-base text-white/75 leading-snug max-w-[85%]">{label}</div>
      </div>
      
      {/* Decorative corner shine */}
      <div className="absolute bottom-[-58px] right-[-58px] h-32 w-32 rounded-full border border-white/10 bg-white/10 blur-[90px]" />
      <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/15 rounded-tl-full" />
    </div>
  );
}