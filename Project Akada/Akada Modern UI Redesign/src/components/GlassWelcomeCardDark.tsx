import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function GlassWelcomeCardDark() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gray-900/40 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20" />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl -ml-24 -mb-24" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-white mb-2">
              Good afternoon, Tosin! Keep the momentum going 💪
            </h2>
            <p className="text-gray-300">
              Every application brings you closer to success ✨
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="icon"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
