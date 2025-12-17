import { Button } from '../ui/button';
import { ArrowRight, Target } from 'lucide-react';

interface GlassActionCardProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export function GlassActionCard({ 
  title = "Continue building your profile",
  subtitle = "Complete your profile to unlock more opportunities",
  buttonText = "Get Started",
  onButtonClick,
  icon = <Target className="w-6 h-6 text-indigo-600" />
}: GlassActionCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 p-5 sm:p-6 shadow-lg">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />

      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-lg bg-white backdrop-blur-sm flex items-center justify-center shrink-0 border border-indigo-200 shadow-sm">
            {icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-indigo-600 uppercase tracking-wider">Next Best Action</span>
              <div className="h-1 w-1 rounded-full bg-indigo-400" />
              <span className="text-xs text-gray-500">Recommended</span>
            </div>
            <h3 className="text-gray-900 text-lg mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">
              {subtitle}
            </p>
            
            <Button
              size="sm"
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              onClick={onButtonClick}
            >
              <span className="hidden sm:inline">{buttonText}</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-tl-full" />
    </div>
  );
}



