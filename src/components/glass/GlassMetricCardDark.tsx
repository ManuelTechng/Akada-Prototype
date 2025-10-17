interface GlassMetricCardDarkProps {
  value: string | number;
  label: string;
  accentColor: string;
}

export function GlassMetricCardDark({ value, label, accentColor }: GlassMetricCardDarkProps) {
  // Figma-accurate dark mode colors - more vibrant and saturated
  const bgColorMap: Record<string, string> = {
    green: 'bg-[#1E5A4C]',    // Profile Complete (vibrant teal/green)
    blue: 'bg-[#2D5B7E]',     // Urgent Deadlines (deep blue)
    purple: 'bg-[#5A4A9F]',   // Program Matches (vibrant purple)
    orange: 'bg-[#8B6F47]',   // Budget Status (warm brown/tan)
  };

  const glowMap: Record<string, string> = {
    green: 'bg-emerald-400/20',
    blue: 'bg-blue-400/20',
    purple: 'bg-purple-400/20',
    orange: 'bg-amber-400/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${bgColorMap[accentColor]} px-4 py-4 sm:px-6 sm:py-5 shadow-lg group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-[140px] sm:h-[160px] flex flex-col justify-center`}>
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_60%)]" />

      {/* Animated glow on hover */}
      <div className="absolute top-[-46px] right-[-46px] w-36 h-36 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-[72px]`} />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-1.5 sm:space-y-2">
        <div className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">{value}</div>
        <div className="text-xs sm:text-sm text-white/80 leading-tight">{label}</div>
      </div>
    </div>
  );
}