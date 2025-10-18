import { Button } from './ui/button';
import { ArrowRight, Target } from 'lucide-react';

export function GlassActionCardDark() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-xl h-[200px] flex flex-col justify-between">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
      
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/20 shadow-md">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Next Best Action</span>
              <div className="h-1 w-1 rounded-full bg-gray-500" />
              <span className="text-xs text-gray-400">Recommended</span>
            </div>
            <h3 className="text-white text-lg mb-2">Continue building your profile</h3>
            <p className="text-gray-300 text-sm mb-4">
              Complete your profile to unlock more opportunities
            </p>
            
            <Button 
              className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Decorative corner */}
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-tl-full" />
    </div>
  );
}
