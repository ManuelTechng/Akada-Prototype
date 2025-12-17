import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function GlassWelcomeCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-indigo-100 p-8 shadow-lg">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50" />
      
      {/* Decorative blurred circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200/30 rounded-full blur-3xl -ml-24 -mb-24" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl text-gray-900 mb-2">
              Good afternoon, Tosin! Keep the momentum going 💪
            </h2>
            <p className="text-gray-600">
              Every application brings you closer to success ✨
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="icon"
            className="bg-white hover:bg-indigo-50 backdrop-blur-sm border border-indigo-200 text-indigo-600 shadow-sm"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
