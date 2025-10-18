import { Card } from './ui/card';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export function ActionCard({ icon: Icon, title, description, onClick }: ActionCardProps) {
  return (
    <Card 
      className="p-6 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Card>
  );
}
