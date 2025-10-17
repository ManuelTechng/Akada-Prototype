type AccentColor = 'green' | 'blue' | 'purple' | 'orange';

interface GlassMetricCardDarkProps {
  value: string | number;
  label: string;
  accentColor: AccentColor;
}

const colorMap: Record<AccentColor, string> = {
  green: 'from-green-500/32 via-emerald-500/22 to-teal-500/18',
  blue: 'from-sky-500/35 via-blue-500/28 to-cyan-500/18',
  purple: 'from-purple-500/32 via-fuchsia-500/24 to-pink-500/18',
  orange: 'from-orange-500/32 via-amber-500/24 to-red-500/18',
};

const glowMap: Record<AccentColor, string> = {
  green: 'bg-emerald-400/45',
  blue: 'bg-sky-400/45',
  purple: 'bg-fuchsia-400/45',
  orange: 'bg-orange-400/45',
};

const cornerAccentMap: Record<AccentColor, string> = {
  green: 'bg-emerald-400/18',
  blue: 'bg-sky-400/18',
  purple: 'bg-fuchsia-400/18',
  orange: 'bg-orange-400/18',
};

export function GlassMetricCardDark({ value, label, accentColor }: GlassMetricCardDarkProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gray-900/45 backdrop-blur-2xl border border-white/12 px-6 py-6 shadow-[0_28px_54px_-32px_rgba(14,24,54,0.85)] group hover:translate-y-[-4px] transition-transform duration-300 cursor-pointer min-h-[180px] w-full max-w-[230px] min-w-[210px] mx-auto">
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[accentColor]}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.12),transparent_52%)]" />
      <div className={`absolute bottom-[-26px] right-[-26px] h-36 w-36 rounded-full ${cornerAccentMap[accentColor]} opacity-90`} />
      
      <div className="absolute top-[-50px] right-[-50px] h-36 w-36 opacity-0 group-hover:opacity-80 transition-opacity duration-500">
        <div className={`absolute inset-0 ${glowMap[accentColor]} rounded-full blur-[88px]`} />
      </div>
      
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="space-y-4">
          <div className="text-[2.35rem] font-semibold text-white leading-none tracking-tight">{value}</div>
          <div className="text-sm text-white/70 leading-snug max-w-[80%]">{label}</div>
        </div>
      </div>
    </div>
  );
}