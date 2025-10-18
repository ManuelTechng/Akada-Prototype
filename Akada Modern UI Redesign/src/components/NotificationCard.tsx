import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, LucideIcon } from 'lucide-react';

interface NotificationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'info';
  onDismiss?: () => void;
}

export function NotificationCard({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = 'default',
  onDismiss 
}: NotificationCardProps) {
  const variantStyles = {
    default: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      actionBg: 'bg-orange-600 hover:bg-orange-700'
    },
    success: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      actionBg: 'bg-green-600 hover:bg-green-700'
    },
    info: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      actionBg: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <Card className={`p-4 ${styles.bg} border-none`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg ${styles.iconBg} shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action && (
            <Button 
              size="sm" 
              className={`${styles.actionBg} text-white`}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
