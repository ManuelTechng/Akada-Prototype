import { Card } from './ui/card';
import { Button } from './ui/button';
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

export function QuickActionsWidgetLight() {
  return (
    <Card className="bg-white/80 backdrop-blur-xl border-indigo-100 p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-indigo-600" />
          <h3 className="text-gray-900">Quick Actions</h3>
        </div>
        <p className="text-sm text-gray-600">Shortcuts to common tasks</p>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-between h-auto p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <action.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-gray-900">{action.label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
          </Button>
        ))}
      </div>
    </Card>
  );
}
