import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Globe, 
  Home, 
  BookOpen, 
  Coffee, 
  Briefcase, 
  Plane, 
  Bus,
  HeartPulse,
  Wifi,
  ShoppingBag,
  HelpCircle,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { convertCurrency, formatCurrency, getCountryCurrency } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface Program {
  id: string;
  name: string;
  university: string;
  country: string;
  tuition_fee: number;
  degree_type: string;
  has_scholarships: boolean;
  duration?: number;
}

const CostCalculator: React.FC = () => {
  const navigate = useNavigate();
  // Mock programs data as a fallback
  const mockPrograms: Program[] = [
    {
      id: '1',
      name: 'MSc Computer Science',
      university: 'University of Toronto',
      country: 'Canada',
      tuition_fee: 42000,
      degree_type: 'Masters',
      has_scholarships: true,
      duration: 2
    },
    {
      id: '2',
      name: 'MSc Artificial Intelligence',
      university: 'University of Edinburgh',
      country: 'UK',
      tuition_fee: 38000,
      degree_type: 'Masters',
      has_scholarships: true,
      duration: 1
    },
    {
      id: '3',
      name: 'MSc Data Science',
      university: 'TU Munich',
      country: 'Germany',
      tuition_fee: 32000,
      degree_type: 'Masters',
      has_scholarships: false,
      duration: 2
    },
    {
      id: '4',
      name: 'MSc Robotics',
      university: 'ETH Zurich',
      country: 'Switzerland',
      tuition_fee: 45000,
      degree_type: 'Masters',
      has_scholarships: true,
      duration: 2
    },
    {
      id: '5',
      name: 'MSc Machine Learning',
      university: 'KTH Royal Institute',
      country: 'Sweden',
      tuition_fee: 35000,
      degree_type: 'Masters',
      has_scholarships: true,
      duration: 2
    },
    {
      id: '6',
      name: 'MSc Cloud Computing',
      university: 'TU Delft',
      country: 'Netherlands',
      tuition_fee: 30000,
      degree_type: 'Masters',
      has_scholarships: false,
      duration: 1.5
    }
  ];

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [showCosts, setShowCosts] = useState(false);
  const [expandedCosts, setExpandedCosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(2); // Default 2 years

  // Cost categories with estimated amounts in USD
  const costCategories = [
    { 
      id: 'tuition', 
      name: 'Tuition & Fees', 
      icon: <BookOpen className="h-5 w-5" />,
      description: "Tuition and mandatory institutional fees",
      isVariable: true // This will be the actual tuition amount from the program
    },
    { 
      id: 'housing', 
      name: 'Housing', 
      icon: <Home className="h-5 w-5" />,
      description: "Rent, utilities, and housing-related expenses",
      amount: { 
        Canada: 12000,
        UK: 15000,
        Germany: 8000,
        Switzerland: 16000,
        USA: 14000,
        Australia: 13000,
        Sweden: 10000,
        Netherlands: 9000,
        default: 12000
      }
    },
    { 
      id: 'food', 
      name: 'Food & Groceries', 
      icon: <Coffee className="h-5 w-5" />,
      description: "Daily meals and grocery expenses",
      amount: {
        Canada: 6000,
        UK: 7000,
        Germany: 4500,
        Switzerland: 8000,
        USA: 6500,
        Australia: 6000,
        Sweden: 5500,
        Netherlands: 5000,
        default: 6000
      }
    },
    { 
      id: 'insurance', 
      name: 'Health Insurance', 
      icon: <HeartPulse className="h-5 w-5" />,
      description: "Medical and health insurance costs",
      amount: {
        Canada: 1000,
        UK: 600,
        Germany: 1200,
        Switzerland: 2000,
        USA: 2500,
        Australia: 800,
        Sweden: 400,
        Netherlands: 1100,
        default: 1200
      }
    },
    { 
      id: 'books', 
      name: 'Books & Supplies', 
      icon: <ShoppingBag className="h-5 w-5" />,
      description: "Textbooks, course materials, and supplies",
      amount: {
        Canada: 1500,
        UK: 1200,
        Germany: 1000,
        Switzerland: 1800,
        USA: 2000,
        Australia: 1400,
        Sweden: 1000,
        Netherlands: 1100,
        default: 1400
      }
    },
    { 
      id: 'transportation', 
      name: 'Local Transportation', 
      icon: <Bus className="h-5 w-5" />,
      description: "Public transit and local travel",
      amount: {
        Canada: 1200,
        UK: 1500,
        Germany: 1000,
        Switzerland: 1800,
        USA: 1500,
        Australia: 1200,
        Sweden: 1100,
        Netherlands: 1000,
        default: 1300
      }
    },
    { 
      id: 'travel', 
      name: 'International Travel', 
      icon: <Plane className="h-5 w-5" />,
      description: "Round-trip flights home per year",
      amount: {
        Canada: 2500,
        UK: 2000,
        Germany: 1800,
        Switzerland: 2000,
        USA: 2800,
        Australia: 3500,
        Sweden: 2200,
        Netherlands: 2000,
        default: 2500
      }
    },
    { 
      id: 'internet', 
      name: 'Internet & Communications', 
      icon: <Wifi className="h-5 w-5" />,
      description: "Internet access and phone bills",
      amount: {
        Canada: 900,
        UK: 800,
        Germany: 600,
        Switzerland: 1000,
        USA: 1200,
        Australia: 1000,
        Sweden: 700,
        Netherlands: 700,
        default: 800
      }
    },
    { 
      id: 'entertainment', 
      name: 'Entertainment & Social', 
      icon: <Briefcase className="h-5 w-5" />,
      description: "Recreation, social activities, and entertainment",
      amount: {
        Canada: 2000,
        UK: 2500,
        Germany: 1800,
        Switzerland: 3000,
        USA: 2500,
        Australia: 2200,
        Sweden: 2000,
        Netherlands: 1800,
        default: 2200
      }
    },
    { 
      id: 'misc', 
      name: 'Miscellaneous', 
      icon: <Globe className="h-5 w-5" />,
      description: "Other expenses including clothes, emergencies, etc.",
      amount: {
        Canada: 2000,
        UK: 2500,
        Germany: 1500,
        Switzerland: 3000,
        USA: 2500,
        Australia: 2000,
        Sweden: 1800,
        Netherlands: 1600,
        default: 2000
      }
    }
  ];

  // Fetch programs data on component mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        // Check if we already have programs in local storage
        const cachedPrograms = localStorage.getItem('akada_programs');
        if (cachedPrograms) {
          setPrograms(JSON.parse(cachedPrograms));
          setLoading(false);
          return;
        }

        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('programs')
          .select('*');

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          setPrograms(data);
          // Cache programs in local storage
          localStorage.setItem('akada_programs', JSON.stringify(data));
        } else {
          // Use mock data if no data is returned
          setPrograms(mockPrograms);
          localStorage.setItem('akada_programs', JSON.stringify(mockPrograms));
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Could not load programs. Using sample data instead.');
        setPrograms(mockPrograms);
        localStorage.setItem('akada_programs', JSON.stringify(mockPrograms));
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  // Get the selected program object
  const selectedProgram = programs.find(program => program.id === selectedProgramId);

  // Set duration based on selected program
  useEffect(() => {
    if (selectedProgram && selectedProgram.duration) {
      setDuration(selectedProgram.duration);
    } else {
      setDuration(2); // Default to 2 years
    }
  }, [selectedProgram]);

  // Toggle cost category expansion
  const toggleCostExpansion = (costId: string) => {
    if (expandedCosts.includes(costId)) {
      setExpandedCosts(expandedCosts.filter(id => id !== costId));
    } else {
      setExpandedCosts([...expandedCosts, costId]);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedProgramId('');
    setShowCosts(false);
    setExpandedCosts([]);
    setDuration(2);
  };

  // Calculate costs for the selected program
  const calculateCosts = () => {
    if (!selectedProgram) return null;

    const costs = costCategories.map(category => {
      let cost = 0;
      
      if (category.id === 'tuition') {
        // Use actual tuition from program
        cost = selectedProgram.tuition_fee;
      } else if (category.isVariable) {
        cost = 0; // Handle any other variable costs
      } else {
        // Use the country-specific cost or default
        const countrySpecificAmount = category.amount ? 
          (category.amount[selectedProgram.country as keyof typeof category.amount] || category.amount.default) :
          0;
        cost = countrySpecificAmount;
      }
      
      // Convert to NGN
      const currency = getCountryCurrency(selectedProgram.country);
      const costInNGN = convertCurrency(cost, currency, 'NGN');
      
      return {
        ...category,
        cost,
        costInNGN,
        annualCost: category.id === 'travel' ? cost : cost, // Travel is once per year
        annualCostNGN: category.id === 'travel' ? costInNGN : costInNGN
      };
    });
    
    // Calculate total annual cost in NGN
    const totalAnnualCostNGN = costs.reduce((acc, curr) => acc + curr.annualCostNGN, 0);
    
    // Calculate total program cost (duration * annual)
    const totalProgramCostNGN = totalAnnualCostNGN * duration;
    
    return {
      costs,
      totalAnnualCostNGN,
      totalProgramCostNGN
    };
  };

  // Format NGN currency
  const formatNGN = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Calculate the cost breakdown
  const costData = selectedProgram ? calculateCosts() : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Cost Calculator</h1>
        <p className="text-gray-600">Estimate your study abroad expenses in Nigerian Naira</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-6 w-6" />
            <h2 className="text-xl font-semibold">International Education Cost Calculator</h2>
          </div>
          <p className="text-indigo-100">
            Estimate the full cost of studying abroad, including tuition and living expenses.
            All costs are approximations and will vary based on lifestyle and location.
          </p>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <div className="mb-6">
            <label htmlFor="program-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select a Program
            </label>
            <select
              id="program-select"
              value={selectedProgramId}
              onChange={(e) => {
                setSelectedProgramId(e.target.value);
                setShowCosts(false);
              }}
              className="w-full p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-label="Select program"
            >
              <option value="">-- Select a program --</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} - {program.university}
                </option>
              ))}
            </select>
            
            {loading && (
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                Loading programs...
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-sm text-red-500">
                {error}
              </div>
            )}
          </div>
          
          {selectedProgram && (
            <>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-800 mb-2">{selectedProgram.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">University:</span> <span className="font-medium text-gray-800">{selectedProgram.university}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Country:</span> <span className="font-medium text-gray-800">{selectedProgram.country}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Degree Type:</span> <span className="font-medium text-gray-800">{selectedProgram.degree_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Annual Tuition:</span>{' '}
                    <span className="font-medium text-gray-800">
                      {formatCurrency(selectedProgram.tuition_fee, getCountryCurrency(selectedProgram.country))}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Program Duration (Years)
                  </label>
                  <select
                    id="duration-select"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value))}
                    className="w-full max-w-xs p-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="1">1 year</option>
                    <option value="1.5">1.5 years</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="4">4 years</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setShowCosts(true)}
                  disabled={!selectedProgram}
                  aria-label="Calculate costs"
                  className={`flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    !selectedProgram ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                  }`}
                >
                  <Calculator className="h-5 w-5" />
                  Calculate Costs
                </button>
                
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </>
          )}
        </div>
        
        {showCosts && selectedProgram && costData && (
          <div className="p-6 transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Estimated Costs for Studying in {selectedProgram.country}
            </h3>
            
            <div className="mb-6 bg-indigo-50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">Total Estimated Annual Cost:</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {formatNGN(costData.totalAnnualCostNGN)}
                </div>
                <div className="text-sm text-gray-500">
                  (Per academic year)
                </div>
              </div>
              
              <div className="h-0.5 w-full bg-indigo-200 sm:h-12 sm:w-0.5"></div>
              
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">Total {duration}-Year Program Cost:</div>
                <div className="text-2xl font-bold text-indigo-700">
                  {formatNGN(costData.totalProgramCostNGN)}
                </div>
                <div className="text-sm text-gray-500">
                  (Full program duration)
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-6">
              {costData.costs.map((cost) => (
                <div 
                  key={cost.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div 
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCostExpansion(cost.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                        {cost.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{cost.name}</h4>
                        <div className="text-indigo-600 font-semibold">
                          {formatNGN(cost.costInNGN)}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="text-gray-400" 
                      aria-label={expandedCosts.includes(cost.id) ? `Collapse ${cost.name} details` : `Expand ${cost.name} details`}
                    >
                      {expandedCosts.includes(cost.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {expandedCosts.includes(cost.id) && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm">
                      <p className="text-gray-600 mb-2">{cost.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-500">Local Currency:</span>{' '}
                          <span className="font-medium text-gray-700">
                            {formatCurrency(cost.cost, getCountryCurrency(selectedProgram.country))}/year
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">In Naira:</span>{' '}
                          <span className="font-medium text-gray-700">
                            {formatNGN(cost.costInNGN)}/year
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </h4>
              <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                <li>Costs are estimates and may vary based on lifestyle and specific location.</li>
                <li>Many universities in {selectedProgram.country} allow international students to work part-time (usually up to 20 hours/week during school terms).</li>
                <li>
                  {selectedProgram.has_scholarships ? (
                    <span className="text-green-700 font-medium">This program offers scholarships which may reduce your costs.</span>
                  ) : (
                    'Consider researching additional scholarships to help offset these costs.'
                  )}
                </li>
              </ul>
            </div>
            
            <div className="text-gray-500 text-sm italic">
              <p>Exchange rates are approximate and may fluctuate. Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostCalculator;