import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Zap, GraduationCap, Award, ArrowRight } from 'lucide-react';

const actions = [
  {
    icon: GraduationCap,
    label: 'Search Programs',
  },
  {
    icon: Award,
    label: 'View Scholarships',
  },
];

const cardClass =
  'relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-lg shadow-slate-200/40 dark:border-white/10 dark:bg-gradient-to-br dark:from-[#151f42]/95 dark:via-[#0c152d]/95 dark:to-[#070d1b]/95 dark:shadow-[0_28px_60px_-28px_rgba(7,12,28,0.85)]';

export function QuickActionsWidget() {
  return (
    <Card className={`${cardClass} p-5 sm:p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300/80">Shortcuts to common tasks</p>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-between h-auto p-4 rounded-2xl border border-slate-200/60 bg-slate-100/70 text-slate-900 hover:border-slate-300 dark:border-white/8 dark:bg-[#182448]/80 dark:text-white dark:hover:border-white/16 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl border border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center dark:bg-indigo-500/20">
                <action.icon className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
              </div>
              <span className="text-sm font-semibold">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Button>
        ))}
      </div>
    </Card>
  );
}

