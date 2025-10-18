interface GlassMetricCardProps {
  value: string | number;
  label: string;
  accentColor: string;
}

export function GlassMetricCard({ value, label, accentColor }: GlassMetricCardProps) {
  // Figma-accurate light mode colors for each status card
  const colorMap: Record<string, string> = {
    green: 'bg-[#E8E5FF]',    // Profile Complete (soft lavender)
    blue: 'bg-[#2D5A6B]',     // Urgent Deadlines (deep teal)
    purple: 'bg-[#E6E3FF]',   // Program Matches (light purple)
    orange: 'bg-[#8B6F47]',   // Budget Status (warm brown)
  };

  const borderMap: Record<string, string> = {
    green: 'border-[#DDD9FF]/60',
    blue: 'border-[#1E4A5F]/40',
    purple: 'border-[#DDD9FF]/60',
    orange: 'border-[#6B5637]/40',
  };

  const textColorMap: Record<string, string> = {
    green: 'text-slate-900',
    blue: 'text-white',      // Dark background needs white text
    purple: 'text-slate-900',
    orange: 'text-white',    // Dark background needs white text
  };

  const glowMap: Record<string, string> = {
    green: 'bg-purple-300/15',
    blue: 'bg-cyan-300/20',
    purple: 'bg-purple-300/15',
    orange: 'bg-amber-300/20',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${colorMap[accentColor]} border ${borderMap[accentColor]} px-4 py-4 sm:px-6 sm:py-5 shadow-lg group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-[140px] sm:h-[160px] flex flex-col justify-center`}>
      {/* Animated glow on hover */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-2xl`} />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-1.5 sm:space-y-2">
        <div className={`text-4xl sm:text-5xl font-bold ${textColorMap[accentColor]} tracking-tight leading-none`}>{value}</div>
        <div className={`text-xs sm:text-sm leading-tight ${accentColor === 'blue' || accentColor === 'orange' ? 'text-white/80' : 'text-slate-600'}`}>{label}</div>
      </div>
    </div>
  );
}


