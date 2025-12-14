import { Card } from './ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', applications: 2, saved: 8 },
  { month: 'Feb', applications: 5, saved: 12 },
  { month: 'Mar', applications: 8, saved: 15 },
  { month: 'Apr', applications: 12, saved: 18 },
  { month: 'May', applications: 15, saved: 20 },
  { month: 'Jun', applications: 18, saved: 22 },
];

export function ProgressChart() {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg text-gray-900 mb-1">Application Progress</h3>
        <p className="text-sm text-gray-500">Your activity over the last 6 months</p>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="applications" 
            stroke="#6366f1" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorApplications)" 
            name="Applications"
          />
          <Area 
            type="monotone" 
            dataKey="saved" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSaved)"
            name="Saved Programs"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-600" />
          <span className="text-sm text-gray-600">Applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600" />
          <span className="text-sm text-gray-600">Saved Programs</span>
        </div>
      </div>
    </Card>
  );
}
