import React from 'react';
import { MapPin, DollarSign, Calendar, Star, Share2, GraduationCap } from 'lucide-react';
import type { Program } from '../lib/types';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../lib/utils';

interface ProgramCardProps {
  program: Program;
  onSave?: () => void;
  onShare?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onSave, onShare }) => {
  const countryCurrency = getCountryCurrency(program.country);
  const localAmount = program.tuition_fee;
  const ngnAmount = convertCurrency(localAmount, countryCurrency, 'NGN');

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-100/50 p-2 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-heading font-semibold text-lg text-gray-900">
              {program.name}
            </h3>
          </div>
          <p className="font-sans text-gray-600">{program.university}</p>
        </div>
        <div className="bg-green-100/50 text-green-700 px-3 py-1 rounded-full text-xs font-medium group-hover:bg-green-100 transition-colors">
          92% Match
        </div>
      </div>
      
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{program.country}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-indigo-600 font-medium">{formatCurrency(localAmount, countryCurrency)}/year</span>
            <span className="text-xs text-gray-500 mt-0.5">≈ {formatCurrency(ngnAmount, 'NGN')}/year</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Sept 2025</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
        <button 
          onClick={onSave}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium group/btn"
        >
          <Star className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
          <span>Save</span>
        </button>
        <button 
          onClick={onShare}
          className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium group/btn"
        >
          <Share2 className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default ProgramCard;