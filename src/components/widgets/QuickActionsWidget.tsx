import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Zap, GraduationCap, Award, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  {
    icon: GraduationCap,
    label: 'Search Programs',
    path: '/app/programs',
  },
  {
    icon: Award,
    label: 'View Scholarships',
    path: '/app/programs?scholarshipsOnly=true',
  },
];

export function QuickActionsWidget() {
  const navigate = useNavigate();

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <Card className="figma-card">
      <div className="figma-card-content">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold figma-text-primary">Quick Actions</h3>
          </div>
          <p className="text-sm figma-text-secondary">Shortcuts to common tasks</p>
        </div>

        {/* Actions List */}
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleActionClick(action.path)}
              className="w-full justify-between h-auto p-3 sm:p-4 rounded-lg border border-border bg-muted figma-text-primary hover:border-primary/50 hover:bg-primary/10 transition-all group"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border border-primary/40 bg-primary/10 flex items-center justify-center shrink-0">
                  <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm font-semibold">{action.label}</span>
              </div>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 figma-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}


