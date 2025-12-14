import { Card } from './ui/card';
import { Button } from './ui/button';
import { Calendar, ChevronRight } from 'lucide-react';

const deadlines = [
  {
    program: 'Stanford CS Masters',
    university: 'Stanford University',
    date: 'Oct 25, 2025',
    daysLeft: 10,
    status: 'urgent',
  },
  {
    program: 'MIT Data Science',
    university: 'Massachusetts Institute of Technology',
    date: 'Nov 1, 2025',
    daysLeft: 17,
    status: 'upcoming',
  },
  {
    program: 'Harvard MBA',
    university: 'Harvard Business School',
    date: 'Nov 15, 2025',
    daysLeft: 31,
    status: 'normal',
  },
];

export function UpcomingDeadlines() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg text-gray-900 mb-1">Upcoming Deadlines</h3>
          <p className="text-sm text-gray-500">Don't miss these important dates</p>
        </div>
        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-4">
        {deadlines.map((deadline, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 ${
              deadline.status === 'urgent' 
                ? 'bg-red-100' 
                : deadline.status === 'upcoming'
                ? 'bg-orange-100'
                : 'bg-gray-100'
            }`}>
              <span className="text-xs text-gray-600">
                {deadline.date.split(' ')[1].replace(',', '')}
              </span>
              <span className={`text-lg ${
                deadline.status === 'urgent' 
                  ? 'text-red-600' 
                  : deadline.status === 'upcoming'
                  ? 'text-orange-600'
                  : 'text-gray-900'
              }`}>
                {deadline.date.split(' ')[0]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 mb-1">{deadline.program}</p>
              <p className="text-sm text-gray-500 mb-2">{deadline.university}</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className={`text-xs ${
                  deadline.status === 'urgent' 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {deadline.daysLeft} days left
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
